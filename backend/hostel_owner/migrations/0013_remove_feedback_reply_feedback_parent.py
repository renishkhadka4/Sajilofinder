# Generated by Django 5.1.6 on 2025-03-31 12:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hostel_owner', '0012_booking_pidx'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='feedback',
            name='reply',
        ),
        migrations.AddField(
            model_name='feedback',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='hostel_owner.feedback'),
        ),
    ]
