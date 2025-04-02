# Generated by Django 5.1.6 on 2025-04-02 10:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hostel_owner', '0014_feedback_reply_alter_feedback_hostel_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='hostel',
            name='category',
            field=models.CharField(choices=[('boys', 'Boys Hostel'), ('girls', 'Girls Hostel'), ('mixed', 'Mixed/Co-ed')], default='mixed', max_length=10),
        ),
    ]
