import json
import urllib.error
import urllib.request

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

SYSTEM_PROMPT = (
    "Siz TalabaHub ilovasining o'quv yordamchisisiz. Talabalarga dars, GPA, "
    "rejalashtirish, vaqtni boshqarish va imtihonga tayyorgarlik bo'yicha qisqa, "
    "aniq va foydali javob bering. Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob bering."
)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """OpenAI-mos LLM API orqali AI suhbat. Kalit .env dagi AI_API_KEY dan olinadi."""

    api_key = getattr(settings, "AI_API_KEY", "")
    if not api_key:
        return Response(
            {
                "detail": (
                    "AI kaliti sozlanmagan. backend/.env ga AI_API_KEY (va kerak bo'lsa "
                    "AI_BASE_URL, AI_MODEL) qo'shing."
                )
            },
            status=503,
        )

    incoming = request.data.get("messages", [])
    if not isinstance(incoming, list):
        return Response({"detail": "messages ro'yxat bo'lishi kerak."}, status=400)

    # Faqat role/content maydonlarini olamiz (xavfsizlik)
    safe_messages = [
        {"role": m.get("role", "user"), "content": str(m.get("content", ""))}
        for m in incoming
        if m.get("content")
    ][-20:]  # oxirgi 20 ta xabar

    payload = {
        "model": getattr(settings, "AI_MODEL", "gpt-4o-mini"),
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + safe_messages,
        "temperature": 0.7,
    }

    url = getattr(settings, "AI_BASE_URL", "https://api.openai.com/v1").rstrip("/") + "/chat/completions"

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        reply = data["choices"][0]["message"]["content"]
        return Response({"reply": reply})
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:300]
        return Response({"detail": f"AI provayder xatosi ({e.code}): {detail}"}, status=502)
    except Exception as e:  # noqa: BLE001
        return Response({"detail": f"AI bilan bog'lanishda xatolik: {e}"}, status=502)
