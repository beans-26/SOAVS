from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_admin', 'is_voter', 'is_verified',
                  'student_id', 'course', 'year_level')

class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False)
    student_id = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        student_id = data.get('student_id')
        password = data.get('password')

        if not email and not student_id:
            raise serializers.ValidationError("Email or Student ID is required.")

        # Try authenticating with whichever identifier is provided
        user = None
        
        # 1. Try student_id first if provided
        if student_id:
            try:
                user_obj = User.objects.get(student_id=student_id)
                user = authenticate(email=user_obj.email, password=password)
            except User.DoesNotExist:
                pass
        
        # 2. Try email (or identifier in 'email' field) if no user yet
        if not user and email:
            # Check if 'email' field contains an actual email or a student_id
            user = authenticate(email=email, password=password)
            if not user:
                try:
                    user_obj = User.objects.get(student_id=email)
                    user = authenticate(email=user_obj.email, password=password)
                except User.DoesNotExist:
                    pass

        if user and user.is_active:
            if not user.is_verified:
                raise serializers.ValidationError("Account not verified. Please verify your email.")
            return user
        raise serializers.ValidationError("Incorrect Credentials")

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'student_id', 'course', 'year_level')
        extra_kwargs = {
            'student_id': {'required': False},
            'course': {'required': False},
            'year_level': {'required': False},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            student_id=validated_data.get('student_id'),
            course=validated_data.get('course', ''),
            year_level=validated_data.get('year_level', ''),
        )
        return user

class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin user management - shows more fields."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'student_id', 'course', 'year_level',
                  'is_admin', 'is_voter', 'is_verified', 'is_active_session',
                  'date_joined')
        read_only_fields = ('id', 'date_joined')
