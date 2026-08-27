import base64
from decimal import Decimal
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from courses.models import Course, Enrollment
from .models import Payment
from .serializers import PaymentSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout(request):
    """Kurs uchun to'lov yaratish (Click, Payme, Uzum)."""
    course_id = request.data.get("course_id")
    provider = request.data.get("provider", "click")
    promo_code = (request.data.get("promo_code") or "").strip().upper()

    course = get_object_or_404(Course, id=course_id)
    price = Decimal(str(course.price))

    if price <= 0:
        # Bepul kurs - to'g'ridan to'g'ri a'zo bo'lish
        Enrollment.objects.get_or_create(user=request.user, course=course)
        return Response(
            {"detail": "Kurs bepul, siz kursga muvaffaqiyatli a'zo bo'ldingiz!", "free": True},
            status=status.HTTP_200_OK,
        )

    # Promo-kod chegirmasi (masalan: TALABA10 -> 10% chegirma, TALABAHUB -> 20% chegirma)
    discount = Decimal("0")
    if promo_code == "TALABA10":
        discount = price * Decimal("0.10")
    elif promo_code in ["TALABAHUB", "STARTUP"]:
        discount = price * Decimal("0.20")

    final_amount = max(price - discount, Decimal("1000"))

    # To'lov yozuvini yaratish
    payment = Payment.objects.create(
        user=request.user,
        course=course,
        amount=final_amount,
        provider=provider,
        status="pending",
    )

    # To'lov havolalarini shakllantirish
    checkout_url = ""
    if provider == "click":
        # Click Merchant URL
        service_id = getattr(settings, "CLICK_SERVICE_ID", "54321")
        merchant_id = getattr(settings, "CLICK_MERCHANT_ID", "12345")
        checkout_url = f"https://my.click.uz/services/pay?service_id={service_id}&merchant_id={merchant_id}&amount={float(final_amount)}&transaction_param={payment.transaction_id}"
    elif provider == "payme":
        # Payme Checkout Base64 URL
        merchant_id = getattr(settings, "PAYME_MERCHANT_ID", "64b1234567890")
        amount_tiyin = int(final_amount * 100)
        pay_str = f"m={merchant_id};ac.order_id={payment.transaction_id};a={amount_tiyin}"
        encoded = base64.b64encode(pay_str.encode("utf-8")).decode("utf-8")
        checkout_url = f"https://checkout.paycom.uz/{encoded}"
    elif provider == "uzum":
        # Uzum Bank Checkout URL
        checkout_url = f"https://www.uzumbank.uz/pay?order_id={payment.transaction_id}&amount={float(final_amount)}"
    else:
        checkout_url = f"/checkout/card/{payment.transaction_id}"

    return Response({
        "payment_id": payment.id,
        "transaction_id": payment.transaction_id,
        "amount": float(final_amount),
        "original_price": float(price),
        "discount": float(discount),
        "provider": provider,
        "checkout_url": checkout_url,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """To'lovni tasdiqlash va kursga kirishni ochish."""
    transaction_id = request.data.get("transaction_id")
    payment = get_object_or_404(Payment, transaction_id=transaction_id, user=request.user)

    # To'lovni tasdiqlash
    payment.status = "completed"
    payment.save(update_fields=["status", "updated_at"])

    # Kursga a'zolikni yaratish
    if payment.course:
        Enrollment.objects.get_or_create(user=payment.user, course=payment.course)

    return Response({
        "success": True,
        "detail": "To'lov muvaffaqiyatli qabul qilindi va kurs darslari ochildi! 🎉",
        "course_id": payment.course.id if payment.course else None,
    }, status=status.HTTP_200_OK)


class MyTransactionsList(generics.ListAPIView):
    """Foydalanuvchining to'lovlar tarixi."""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by("-created_at")
