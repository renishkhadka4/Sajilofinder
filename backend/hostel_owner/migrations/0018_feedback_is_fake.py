# Generated by Django 5.1.6 on 2025-04-02 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hostel_owner', '0017_hostel_is_verified'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedback',
            name='is_fake',
            field=models.BooleanField(default=False),
        ),
    ]
