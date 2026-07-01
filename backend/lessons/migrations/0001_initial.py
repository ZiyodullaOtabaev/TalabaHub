import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Lesson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("category", models.CharField(choices=[("growth", "Shaxsiy rivojlanish"), ("ielts", "IELTS")], db_index=True, max_length=20)),
                ("content_lang", models.CharField(choices=[("uz", "O'zbek"), ("en", "Ingliz")], db_index=True, max_length=2)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("youtube_url", models.URLField()),
                ("order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="lessons", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["order", "-created_at"],
            },
        ),
    ]
