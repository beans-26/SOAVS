from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'student_id', 'is_admin', 'is_voter', 'is_verified')
    list_filter = ('is_admin', 'is_voter', 'is_verified', 'year_level')
    search_fields = ('email', 'username', 'student_id')
    ordering = ('email',)

    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('student_id', 'is_admin', 'is_voter', 'is_verified', 'otp_code', 'course', 'year_level', 'is_active_session', 'session_started_at')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('student_id', 'is_admin', 'is_voter', 'is_verified', 'otp_code', 'course', 'year_level', 'is_active_session', 'session_started_at')}),
    )
