from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_admin = models.BooleanField(default=False)
    is_voter = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    student_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    course = models.CharField(max_length=100, blank=True, default='')
    year_level = models.CharField(max_length=20, blank=True, default='')
    is_active_session = models.BooleanField(default=False)
    session_started_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
