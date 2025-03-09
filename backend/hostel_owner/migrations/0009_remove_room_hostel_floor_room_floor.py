# Generated by Django 5.1.6 on 2025-03-09 15:04

import django.db.models.deletion
import hostel_owner.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hostel_owner', '0008_hostel_air_conditioning_hostel_alcohol_allowed_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='hostel',
        ),
        migrations.CreateModel(
            name='Floor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('floor_number', models.PositiveIntegerField()),
                ('description', models.TextField(blank=True, null=True)),
                ('hostel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='floors', to='hostel_owner.hostel')),
            ],
            options={
                'unique_together': {('hostel', 'floor_number')},
            },
        ),
        migrations.AddField(
            model_name='room',
            name='floor',
            field=models.ForeignKey(default=hostel_owner.models.get_default_floor, on_delete=django.db.models.deletion.CASCADE, related_name='rooms', to='hostel_owner.floor'),
        ),
    ]
