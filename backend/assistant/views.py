import requests as http_requests

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

    try:
        resp = http_requests.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
        return Response({"reply": reply})
    except http_requests.exceptions.HTTPError as e:
        detail = e.response.text[:300] if e.response else str(e)
        status_code = e.response.status_code if e.response else 502
        return Response(
            {"detail": f"AI provayder xatosi ({status_code}): {detail}"},
            status=502,
        )
    except http_requests.exceptions.Timeout:
        return Response(
            {"detail": "AI provayder javob bermadi (timeout)."},
            status=504,
        )
    except Exception as e:  # noqa: BLE001
        return Response({"detail": f"AI bilan bog'lanishda xatolik: {e}"}, status=502)
