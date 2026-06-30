import json
import traceback

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# requests kutubxonasi mavjudligini tekshiramiz
try:
    import requests as http_client

    HAS_REQUESTS = True
except ImportError:
    import urllib.error
    import urllib.request

    HAS_REQUESTS = False

SYSTEM_PROMPT = (
    "Siz TalabaHub ilovasining o'quv yordamchisisiz. Talabalarga dars, GPA, "
    "rejalashtirish, vaqtni boshqarish va imtihonga tayyorgarlik bo'yicha qisqa, "
    "aniq va foydali javob bering. Foydalanuvchi qaysi tilda yozsa, o'sha tilda javob bering."
)


def _call_with_requests(url, headers, payload):
    """requests kutubxonasi bilan chaqirish (Groq/Cloudflare uchun eng ishonchli)."""
    resp = http_client.post(url, headers=headers, json=payload, timeout=60)
    if resp.status_code != 200:
        return None, f"AI provayder xatosi ({resp.status_code}): {resp.text[:300]}"
    data = resp.json()
    return data["choices"][0]["message"]["content"], None


def _call_with_urllib(url, headers, payload):
    """Fallback: requests o'rnatilmagan bo'lsa urllib ishlatamiz."""
    headers["User-Agent"] = "TalabaHub/1.0"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"], None
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:300]
        return None, f"AI provayder xatosi ({e.code}): {detail}"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """OpenAI-mos LLM API orqali AI suhbat."""

    api_key = getattr(settings, "AI_API_KEY", "")
    if not api_key:
        return Response(
            {
                "detail": (
                    "AI kaliti sozlanmagan. backend/.env ga AI_API_KEY qo'shing. "
                    "Bepul Groq kaliti: https://console.groq.com"
                )
            },
            status=503,
        )

    incoming = request.data.get("messages", [])
    if not isinstance(incoming, list):
        return Response({"detail": "messages ro'yxat bo'lishi kerak."}, status=400)

    safe_messages = [
        {"role": m.get("role", "user"), "content": str(m.get("content", ""))}
        for m in incoming
        if m.get("content")
    ][-20:]

    payload = {
        "model": getattr(settings, "AI_MODEL", "gpt-4o-mini"),
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + safe_messages,
        "temperature": 0.7,
    }

    base_url = getattr(settings, "AI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    url = f"{base_url}/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        if HAS_REQUESTS:
            reply, error = _call_with_requests(url, headers, payload)
        else:
            reply, error = _call_with_urllib(url, headers, payload)

        if error:
            return Response({"detail": error}, status=502)

        return Response({"reply": reply})

    except Exception as e:  # noqa: BLE001
        tb = traceback.format_exc()
        print(f"[TalabaHub AI ERROR]\n{tb}")  # noqa: T201 (server logga chiqadi)
        return Response(
            {"detail": f"AI bilan bog'lanishda xatolik: {type(e).__name__}: {e}"},
            status=502,
        )
