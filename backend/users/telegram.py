import requests
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


def get_bot_token():
    return getattr(settings, "TELEGRAM_BOT_TOKEN", "8867467431:AAGHEOlza8rr_MwJUzfIV3hx99_Qk1oemLk")


def send_telegram_message(chat_id, text, reply_markup=None):
    """Telegram Bot API orqali xabar va tugmalar yuborish."""
    token = get_bot_token()
    if not token or not chat_id:
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    try:
        resp = requests.post(url, json=payload, timeout=5)
        return resp.ok
    except Exception:
        return False


def get_main_keyboard():
    """Bot uchun asosiy interaktiv menyu tugmalari."""
    webapp_url = getattr(settings, "TELEGRAM_WEBAPP_URL", "https://talabahub-psi.vercel.app")
    return {
        "inline_keyboard": [
            [
                {"text": "🚀 TalabaHub Ilovasini Ochish", "web_app": {"url": webapp_url}},
            ],
            [
                {"text": "📊 GPA Hisoblash", "web_app": {"url": f"{webapp_url}/gpa"}},
                {"text": "🎓 Video Kurslar", "web_app": {"url": f"{webapp_url}/courses"}},
            ],
            [
                {"text": "💬 Talabalar Chati", "web_app": {"url": f"{webapp_url}/chat"}},
                {"text": "👤 Profil & Bog'lash", "web_app": {"url": f"{webapp_url}/profile"}},
            ],
        ]
    }


def process_telegram_update(update_data):
    """
    Telegram webhook orqali kelgan update-ni qayta ishlash.
    `/start 123456` kabi komandalar orqali foydalanuvchini ulash.
    """
    message = update_data.get("message", {})
    chat = message.get("chat", {})
    text = message.get("text", "").strip()

    chat_id = str(chat.get("id", ""))
    if not chat_id or not text:
        return

    first_name = chat.get("first_name", "Talaba")
    keyboard = get_main_keyboard()

    if text.startswith("/start"):
        parts = text.split()
        if len(parts) > 1:
            code = parts[1].strip()
            # Kodingiz orqali foydalanuvchini topamiz
            user = User.objects.filter(telegram_link_code=code).first()
            if user:
                user.telegram_chat_id = chat_id
                user.telegram_link_code = None
                user.save(update_fields=["telegram_chat_id", "telegram_link_code"])

                send_telegram_message(
                    chat_id,
                    f"🎉 <b>Tabriklaymiz, {user.username}!</b>\n\n"
                    f"✅ Sizning <b>TalabaHub Pro</b> hisobingiz bot bilan muvaffaqiyatli bog'landi.\n\n"
                    f"Endi barcha yangiliklar, dars jadvali va GPA eslatmalari to'g'ridan-to'g'ri shu botga keladi! 🔔",
                    reply_markup=keyboard,
                )
                return
            else:
                send_telegram_message(
                    chat_id,
                    "❌ <b>Noto'g'ri yoki eskirgan ulash kodi.</b>\nIltimos, saytdagi profilingizdan yangi kod oling.",
                    reply_markup=keyboard,
                )
                return

        send_telegram_message(
            chat_id,
            f"👋 <b>Assalomu alaykum, {first_name}!</b>\n\n"
            f"🎓 <b>TalabaHub Pro</b> rasmiy botiga xush kelibsiz!\n\n"
            f"Bu yerda siz:\n"
            f"• 📈 GPA va HEMIS ballaringizni hisoblashingiz\n"
            f"• 📹 IELTS, CEFR va Dasturlash kurslarini ko'rishingiz\n"
            f"• 💬 Talabalar jamoasi bilan muloqot qilishingiz mumkin!\n\n"
            f"Quyidagi tugmalar orqali platformani Telegram'dan chiqmasdan oching: 👇",
            reply_markup=keyboard,
        )
        return

    elif text in ["/help", "/yordam"]:
        send_telegram_message(
            chat_id,
            "ℹ️ <b>TalabaHub Bot Buyruqlari:</b>\n\n"
            "/start - Botni qayta ishga tushirish\n"
            "/app - TalabaHub ilovasini ochish\n"
            "/help - Yordam ma'lumotlari\n\n"
            "Savollar yoki takliflar bo'lsa @talabahub_admin ga murojaat qiling.",
            reply_markup=keyboard,
        )
        return

    elif text in ["/app", "/gpa", "/kurslar"]:
        send_telegram_message(
            chat_id,
            "🚀 <b>TalabaHub Mini App:</b>\nPlatformani ochish uchun quyidagi tugmani bosing:",
            reply_markup=keyboard,
        )
        return

    # Standart javob
    send_telegram_message(
        chat_id,
        f"🤖 <b>TalabaHub Bot</b> sizning xizmatingizda!\n\n"
        f"Platformani ochish yoki bo'limlarni ko'rish uchun quyidagi tugmalardan foydalaning:",
        reply_markup=keyboard,
    )
