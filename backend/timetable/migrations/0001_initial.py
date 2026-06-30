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
            name="ClassSession",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("subject", models.CharField(max_length=255)),
                (
                    "weekday",
                    models.IntegerField(
                        choices=[
                            (0, "Dushanba"),
                            (1, "Seshanba"),
                            (2, "Chorshanba"),
                            (3, "Payshanba"),
                            (4, "Juma"),
                            (5, "Shanba"),
                            (6, "Yakshanba"),
                        ]
                    ),
                ),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("room", models.CharField(blank=True, max_length=100)),
                ("teacher", models.CharField(blank=True, max_length=255)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="class_sessions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["weekday", "start_time"],
            },
        ),
    ]
