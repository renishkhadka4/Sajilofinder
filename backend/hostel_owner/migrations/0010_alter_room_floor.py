# Generated by Django 5.1.6 on 2025-03-27 16:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hostel_owner', '0009_alter_booking_room'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='floor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rooms', to='hostel_owner.floor'),
        ),
    ]
