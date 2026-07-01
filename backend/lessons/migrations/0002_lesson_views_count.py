from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lessons", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="views_count",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
