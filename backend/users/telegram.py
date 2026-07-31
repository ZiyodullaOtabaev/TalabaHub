import requests
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


def get_bot_token():
    return getattr(settings, "TELEGRAM_BOT_TOKEN", "")


def send_telegram_message(chat_id, text):
    """Telegram Bot API orqali xabar yuborish."""
    token = get_bot_token()
    if not token or not chat_id:
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    try:
        resp = requests.post(url, json=payload, timeout=5)
        return resp.ok
    except Exception:
        return False


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
                    f"🎉 <b>Salom {user.username}!</b>\n\n"
                    f"Sizning TalabaHub hisobingiz muvaffaqiyatli bog'landi.\n"
                    f"Endi dars jadvali va muhim eslatmalarni shu bot orqali olasiz! 🚀"
                )
                return
            else:
                send_telegram_message(chat_id, "❌ Noto'g'ri yoki eskirgan ulash kodi.")
                return

        send_telegram_message(
            chat_id,
            "👋 <b>TalabaHub Botga xush kelibsiz!</b>\n\n"
            "Hisobingizni ulash uchun saytdagi profil sahifasidan ulash kodini oling va shu botga <code>/start KOD</code> shaklida yuboring."
        )
