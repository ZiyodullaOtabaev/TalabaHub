import time
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from users.telegram import process_telegram_update


class Command(BaseCommand):
    help = "Telegram Bot Polling runner (lokal ishga tushirish uchun)"

    def handle(self, *args, **options):
        token = getattr(settings, "TELEGRAM_BOT_TOKEN", "")
        if not token:
            self.stderr.write("TELEGRAM_BOT_TOKEN sozlanmagan!")
            return

        self.stdout.write(self.style.SUCCESS("TalabaHub Telegram Bot polling ishga tushdi..."))
        offset = 0

        while True:
            try:
                url = f"https://api.telegram.org/bot{token}/getUpdates?offset={offset}&timeout=30"
                resp = requests.get(url, timeout=35)
                if resp.ok:
                    data = resp.json()
                    for update in data.get("result", []):
                        offset = update["update_id"] + 1
                        process_telegram_update(update)
            except Exception as e:
                self.stderr.write(f"Xatolik: {e}")
                time.sleep(3)
