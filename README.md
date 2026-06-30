# TalabaHub

Talabalar uchun **GPA kalkulyator** va **vazifalar rejalashtiruvchi (planner)** veb-ilovasi.
GPA O'zbekiston OTM **5 balli baho tizimida** hisoblanadi.

## Texnologiyalar

**Backend**
- Python / Django + Django REST Framework
- JWT autentifikatsiya (SimpleJWT)
- SQLite (standart), django-cors-headers, django-environ

**Frontend**
- React + Vite
- TailwindCSS
- React Router, axios, react-hot-toast
- recharts (grafiklar), react-big-calendar (kalendar)

## Loyiha tuzilishi

```
TalabaHub/
├── backend/
│   ├── backend/        # settings, urls, wsgi, asgi
│   ├── users/          # User modeli, register, profil
│   ├── gpa/            # Subject modeli, GPA hisoblash
│   ├── planner/        # Task modeli
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/  # Layout, widgetlar, ui/
    │   ├── pages/       # Login, Register, Dashboard, GPA, Planner, Profile
    │   ├── i18n/        # LanguageProvider (uz / en / ru)
    │   ├── api.js       # axios + token refresh
    │   └── main.jsx
    └── .env.example
```

## Ishga tushirish

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate

pip install -r requirements.txt

# Muhit o'zgaruvchilari
cp .env.example .env          # Windows: copy .env.example .env
# .env ichida yangi SECRET_KEY qo'ying va DEBUG=True qiling
# Kalit generatsiya qilish:
#   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

python manage.py migrate
python manage.py createsuperuser   # ixtiyoriy (admin panel uchun)
python manage.py runserver
```

Backend manzili: `http://127.0.0.1:8000`

### 2. Frontend

```bash
cd frontend
npm install

cp .env.example .env          # Windows: copy .env.example .env
# .env ichida VITE_API_URL ni backend manziliga moslang

npm run dev
```

Frontend manzili: `http://localhost:5173`

## Atrof-muhit o'zgaruvchilari (.env)

**backend/.env**

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `SECRET_KEY` | Django maxfiy kaliti |
| `DEBUG` | `True` (dev) / `False` (prod) |
| `ALLOWED_HOSTS` | Vergul bilan ajratilgan hostlar |
| `CORS_ALLOW_ALL_ORIGINS` | Odatda `False` |
| `CORS_ALLOWED_ORIGINS` | Ruxsat etilgan frontend manzillari |

**frontend/.env**

| O'zgaruvchi | Tavsif |
|-------------|--------|
| `VITE_API_URL` | Backend API manzili |

## API endpointlari (asosiy)

| Metod | Manzil | Tavsif |
|-------|--------|--------|
| POST | `/api/auth/login/` | Login (access + refresh token) |
| POST | `/api/auth/refresh/` | Access tokenni yangilash |
| POST | `/api/users/register/` | Ro'yxatdan o'tish |
| GET | `/api/users/me/` | Joriy foydalanuvchi profili |
| GET/POST | `/api/gpa/subjects/` | Fanlar (CRUD) |
| GET | `/api/gpa/calculate/` | GPA hisoblash |
| GET/POST | `/api/planner/tasks/` | Vazifalar (CRUD) |

## GPA baho tizimi (5 balli)

| Baho | Ball |
|------|------|
| A'lo | 5 |
| Yaxshi | 4 |
| Qoniqarli | 3 |
| Qoniqarsiz | 2 |

GPA = (Σ baho × kredit) / (Σ kredit), 0.00–5.00 shkalada.

## Testlar

```bash
cd backend
python manage.py test
```

## Tillar

Interfeys uchta tilda: **O'zbek**, **Ingliz**, **Rus**. Tilni yuqori menyudan almashtirish mumkin.
