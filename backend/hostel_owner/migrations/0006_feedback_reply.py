# Generated by Django 5.1.6 on 2025-03-21 07:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hostel_owner', '0005_hostel_cancellation_policy'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedback',
            name='reply',
            field=models.TextField(blank=True, null=True),
        ),
    ]
