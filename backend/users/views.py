from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, BasePermission, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .serializers import (
    AdminUserSerializer,
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
)

User = get_user_model()


class IsSuperUser(BasePermission):
    """Faqat super-admin (egasi)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # Email berilgan bo'lsa tasdiqlash kodini yuborish
        if user.email:
            _send_verification_code(user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data["detail"] = "Hisob yaratildi. Emailingizga tasdiqlash kodi yuborildi."
        return response


def _send_verification_code(user):
    """Tasdiqlash kodini yaratib emailga yuborish (Resend API, background thread)."""
    import threading
    from .models import EmailVerification

    verification = EmailVerification.generate(user)

    def _send():
        _send_email_via_resend(
            to=user.email,
            subject="TalabaHub — Email tasdiqlash kodi",
            body=(
                f"Salom {user.username}!\n\n"
                f"Emailingizni tasdiqlash uchun quyidagi kodni kiriting:\n\n"
                f"    {verification.code}\n\n"
                f"Kod 15 daqiqa amal qiladi.\n\n"
                f"— TalabaHub jamoasi"
            ),
        )

    threading.Thread(target=_send, daemon=True).start()


def _send_email_via_resend(to, subject, body):
    """Resend.com API orqali email yuborish."""
    import requests as http_requests
    from django.conf import settings

    api_key = getattr(settings, "RESEND_API_KEY", "")
    if not api_key:
        return

    try:
        http_requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": "TalabaHub <onboarding@resend.dev>",
                "to": [to],
                "subject": subject,
                "text": body,
            },
            timeout=10,
        )
    except Exception:
        pass


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET — profil ma'lumotlari; PATCH/PUT — profilni yangilash."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_object(self):
        return self.request.user


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Joriy parolni bilgan holda yangi parol o'rnatish."""
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save(update_fields=["password"])

    return Response({"detail": "Parol muvaffaqiyatli o'zgartirildi."})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Email orqali parol tiklash tokenini yaratish va emailga yuborish."""
    from django.conf import settings
    from django.core.mail import send_mail

    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Xavfsizlik: email mavjud yoki yo'qligini bildirmaymiz
        return Response(
            {"detail": "Agar bu email ro'yxatdan o'tgan bo'lsa, tiklash kodi yuborildi."}
        )

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    # Frontend URL (parolni tiklash sahifasi)
    frontend_url = settings.FRONTEND_URL if hasattr(settings, "FRONTEND_URL") else "http://localhost:5173"
    reset_link = f"{frontend_url}/password-reset?uid={uid}&token={token}"

    # Email yuborish
    subject = "TalabaHub — Parolni tiklash"
    message = (
        f"Salom {user.username}!\n\n"
        f"Parolni tiklash uchun quyidagi kodni ishlating:\n\n"
        f"Kod: {token}\n"
        f"UID: {uid}\n\n"
        f"Yoki bu havolani oching:\n{reset_link}\n\n"
        f"Agar siz bu so'rovni yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.\n\n"
        f"— TalabaHub jamoasi"
    )

    import threading

    def _send():
        _send_email_via_resend(
            to=email,
            subject="TalabaHub — Parolni tiklash",
            body=message,
        )

    threading.Thread(target=_send, daemon=True).start()

    return Response({
        "detail": "Agar bu email ro'yxatdan o'tgan bo'lsa, tiklash kodi yuborildi.",
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Token orqali yangi parol o'rnatish."""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {"detail": "Noto'g'ri yoki eskirgan havola."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token = serializer.validated_data["token"]
    if not default_token_generator.check_token(user, token):
        return Response(
            {"detail": "Noto'g'ri yoki eskirgan havola."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(serializer.validated_data["new_password"])
    user.save(update_fields=["password"])

    return Response({"detail": "Parol muvaffaqiyatli tiklandi. Endi yangi parol bilan kiring."})


class AdminUserListView(generics.ListAPIView):
    """Barcha foydalanuvchilar ro'yxati — faqat adminlar (is_staff) ko'radi.

    ?search=<matn> orqali username/email bo'yicha qidirish mumkin (tez topish uchun).
    """

    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        return qs


@api_view(["POST"])
@permission_classes([IsSuperUser])
def set_admin(request, user_id):
    """Admin (is_staff) huquqini berish/olib tashlash — faqat super-admin."""
    target = get_object_or_404(User, pk=user_id)

    if target.is_superuser:
        return Response(
            {"detail": "Super-adminning huquqlarini o'zgartirib bo'lmaydi."},
            status=400,
        )

    is_admin = bool(request.data.get("is_admin"))
    target.is_staff = is_admin
    target.save(update_fields=["is_staff"])

    return Response(AdminUserSerializer(target).data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def ban_user(request, user_id):
    """Foydalanuvchini ban/unban qilish — admin."""
    target = get_object_or_404(User, pk=user_id)

    if target.is_superuser:
        return Response({"detail": "Super-adminni ban qilib bo'lmaydi."}, status=400)
    if target.is_staff and not request.user.is_superuser:
        return Response({"detail": "Adminni faqat super-admin ban qila oladi."}, status=400)

    is_banned = bool(request.data.get("is_banned", True))
    reason = request.data.get("reason", "")

    target.is_banned = is_banned
    target.ban_reason = reason if is_banned else ""
    target.save(update_fields=["is_banned", "ban_reason"])

    return Response(AdminUserSerializer(target).data)


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_delete_article(request, article_id):
    """Admin istalgan maqolani o'chirishi mumkin."""
    from articles.models import Article
    article = get_object_or_404(Article, pk=article_id)
    article.delete()
    return Response({"detail": "Maqola o'chirildi."})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_statistics(request):
    """Sayt statistikasi — faqat admin ko'radi.

    Qaytaradi:
    - Jami foydalanuvchilar
    - Aktiv foydalanuvchilar (oxirgi 24 soat, 7 kun, 30 kun)
    - Bugungi yangi ro'yxatdan o'tganlar
    - Haftalik o'sish (oxirgi 7 kun har kuniga)
    - Premium foydalanuvchilar
    - Jami vazifalar va bajarilganlari
    - O'rtacha GPA
    """
    from datetime import timedelta
    from django.db.models import Avg, Count, Sum
    from django.db.models.functions import TruncDate
    from django.utils import timezone

    now = timezone.now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_users = User.objects.count()
    active_24h = User.objects.filter(last_active__gte=now - timedelta(hours=24)).count()
    active_7d = User.objects.filter(last_active__gte=now - timedelta(days=7)).count()
    active_30d = User.objects.filter(last_active__gte=now - timedelta(days=30)).count()

    new_today = User.objects.filter(date_joined__gte=today).count()
    new_this_week = User.objects.filter(date_joined__gte=now - timedelta(days=7)).count()
    new_this_month = User.objects.filter(date_joined__gte=now - timedelta(days=30)).count()

    premium_users = User.objects.filter(is_premium=True).count()

    # Oxirgi 30 kunlik o'sish grafigi (har kuniga nechta yangi)
    daily_growth = (
        User.objects.filter(date_joined__gte=now - timedelta(days=30))
        .annotate(date=TruncDate("date_joined"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )

    # Vazifalar statistikasi
    from planner.models import Task
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(completed=True).count()

    # GPA statistikasi
    from gpa.models import Subject
    subjects_count = Subject.objects.count()

    # Banner statistikasi
    from banners.models import Banner
    active_banners = Banner.objects.filter(is_active=True).count()
    total_impressions = Banner.objects.aggregate(total=Sum("impressions"))["total"] or 0
    total_clicks = Banner.objects.aggregate(total=Sum("clicks"))["total"] or 0

    return Response({
        "users": {
            "total": total_users,
            "active_24h": active_24h,
            "active_7d": active_7d,
            "active_30d": active_30d,
            "new_today": new_today,
            "new_this_week": new_this_week,
            "new_this_month": new_this_month,
            "premium": premium_users,
        },
        "daily_growth": [
            {"date": str(d["date"]), "count": d["count"]}
            for d in daily_growth
        ],
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "completion_rate": round(
                (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1
            ),
        },
        "subjects_count": subjects_count,
        "banners": {
            "active": active_banners,
            "total_impressions": total_impressions,
            "total_clicks": total_clicks,
        },
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def google_auth(request):
    """Google Sign-In orqali login/register.

    Frontend Google Identity Services'dan olingan credential (ID token) ni yuboradi.
    Backend tokenni tekshirib, foydalanuvchini yaratadi yoki topib, JWT qaytaradi.
    """
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token
    from rest_framework_simplejwt.tokens import RefreshToken
    from django.conf import settings

    credential = request.data.get("credential")
    if not credential:
        return Response({"detail": "credential maydoni talab qilinadi."}, status=400)

    client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
    if not client_id:
        return Response(
            {"detail": "Google OAuth sozlanmagan. GOOGLE_CLIENT_ID ni .env ga qo'shing."},
            status=503,
        )

    try:
        # Google ID tokenni tekshirish
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id,
        )
    except ValueError:
        return Response({"detail": "Google token noto'g'ri yoki eskirgan."}, status=400)

    # Google'dan olingan ma'lumotlar
    google_email = idinfo.get("email", "")
    google_name = idinfo.get("name", "")
    email_verified = idinfo.get("email_verified", False)

    if not google_email or not email_verified:
        return Response({"detail": "Google hisobi tasdiqlanmagan."}, status=400)

    # Foydalanuvchini email bo'yicha topish yoki yaratish
    try:
        user = User.objects.get(email=google_email)
    except User.DoesNotExist:
        # Yangi foydalanuvchi yaratish
        # Username sifatida email'ning @ dan oldingi qismini olamiz
        base_username = google_email.split("@")[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=google_email,
            password=None,  # Parol yo'q — faqat Google orqali kiradi
        )
        user.email_verified = True
        # Google'dan olingan ismni saqlash (agar bor bo'lsa)
        if google_name:
            parts = google_name.split(" ", 1)
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = parts[1]
        user.save()

    # JWT tokenlar yaratish
    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    """Email tasdiqlash — kod tekshirish.

    Body: {"email": "...", "code": "123456"}
    """
    from .models import EmailVerification

    email = request.data.get("email", "").strip()
    code = request.data.get("code", "").strip()

    if not email or not code:
        return Response({"detail": "email va code talab qilinadi."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"detail": "Foydalanuvchi topilmadi."}, status=400)

    if user.email_verified:
        return Response({"detail": "Email allaqachon tasdiqlangan."})

    # Oxirgi ishlatilmagan kodni tekshirish
    verification = (
        EmailVerification.objects.filter(user=user, used=False)
        .order_by("-created_at")
        .first()
    )

    if not verification:
        return Response({"detail": "Tasdiqlash kodi topilmadi. Qayta yuborishni so'rang."}, status=400)

    if verification.is_expired:
        return Response({"detail": "Kod eskirgan. Qayta yuborishni so'rang."}, status=400)

    if verification.code != code:
        return Response({"detail": "Kod noto'g'ri."}, status=400)

    # Tasdiqlash
    verification.used = True
    verification.save(update_fields=["used"])
    user.email_verified = True
    user.save(update_fields=["email_verified"])

    return Response({"detail": "Email muvaffaqiyatli tasdiqlandi! Endi login qilishingiz mumkin."})


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_verification(request):
    """Tasdiqlash kodini qayta yuborish.

    Body: {"email": "..."}
    """
    email = request.data.get("email", "").strip()
    if not email:
        return Response({"detail": "email talab qilinadi."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Xavfsizlik: foydalanuvchi bor/yo'qligini bildirmaymiz
        return Response({"detail": "Agar email ro'yxatdan o'tgan bo'lsa, kod yuborildi."})

    if user.email_verified:
        return Response({"detail": "Email allaqachon tasdiqlangan."})

    _send_verification_code(user)
    return Response({"detail": "Yangi tasdiqlash kodi yuborildi."})


@api_view(["GET"])
@permission_classes([AllowAny])
def public_stats(request):
    """Landing page uchun ochoq statistika (login talab qilinmaydi)."""
    total_users = User.objects.count()
    return Response({"total_users": total_users})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_telegram_link(request):
    """Telegram ulash kodi va statusini olish."""
    user = request.user
    if not user.telegram_link_code and not user.telegram_chat_id:
        user.generate_telegram_code()

    return Response({
        "is_linked": bool(user.telegram_chat_id),
        "code": user.telegram_link_code,
        "chat_id": user.telegram_chat_id,
        "bot_username": getattr(settings, "TELEGRAM_BOT_USERNAME", "TalabaHubBot"),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unlink_telegram(request):
    """Telegram bog'lanishini uzish."""
    user = request.user
    user.telegram_chat_id = None
    user.telegram_link_code = None
    user.save(update_fields=["telegram_chat_id", "telegram_link_code"])
    return Response({"detail": "Telegram bot muvaffaqiyatli uzildi."})


@api_view(["POST"])
@permission_classes([AllowAny])
def telegram_webhook(request):
    """Telegram bot webhook update qabul qilish."""
    from .telegram import process_telegram_update
    update_data = request.data
    if isinstance(update_data, dict):
        process_telegram_update(update_data)
    return Response({"status": "ok"})
