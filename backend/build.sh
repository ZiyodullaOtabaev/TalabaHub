#!/usr/bin/env bash
# Render build script
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput

# Superuser yaratish (agar mavjud bo'lmasa)
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='Ziyodulla').exists():
    u = User.objects.create_superuser(username='Ziyodulla', email='ziyodullamee@gmail.com', password='Ziyodulla2003!')
    u.email_verified = True
    u.save()
    print('Superuser yaratildi')
else:
    print('Superuser allaqachon mavjud')
"
