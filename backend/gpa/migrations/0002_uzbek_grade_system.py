import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gpa", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="subject",
            name="credit",
            field=models.IntegerField(
                validators=[django.core.validators.MinValueValidator(1)]
            ),
        ),
        migrations.AlterField(
            model_name="subject",
            name="grade",
            field=models.CharField(
                choices=[
                    ("5", "A'lo (5)"),
                    ("4", "Yaxshi (4)"),
                    ("3", "Qoniqarli (3)"),
                    ("2", "Qoniqarsiz (2)"),
                ],
                max_length=2,
            ),
        ),
    ]
