from rest_framework import status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.core.mail import send_mail
from .serializers import LoginSerializer, UserSerializer, RegisterSerializer
from .models import User

class LoginView(views.APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(views.APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate OTP
            otp = f"{random.randint(100000, 999999)}"
            user.otp_code = otp
            user.save()
            
            # Send Email
            subject = 'Your SOAVS Verification Code'
            message = f'Hello {user.username},\n\nYour verification code is: {otp}\n\nPlease use this code to verify your account.'
            from_email = 'vinsdagaraga@gmail.com'
            recipient_list = [user.email]
            
            try:
                send_mail(subject, message, from_email, recipient_list)
            except Exception as e:
                return Response({"error": "Failed to send email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "Registration successful. Please verify your OTP.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(views.APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        try:
            user = User.objects.get(email=email)
            if user.otp_code == otp:
                user.is_verified = True
                user.otp_code = None
                user.save()
                return Response({"message": "Account verified successfully!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


