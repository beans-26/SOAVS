from rest_framework import status, views, viewsets, permissions, parsers
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
import random
import csv
import io
from django.core.mail import send_mail
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

from .serializers import LoginSerializer, UserSerializer, RegisterSerializer, AdminUserSerializer
from .models import User
from elections.models import Election


class LoginView(views.APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data

            # If the user is a voter (not an admin), check for active/upcoming elections
            # Note: We removed the hard 403 block for voters when no elections are active
            # to allow them to log in and see the dashboard/empty state.
            
            if not user.is_admin:
                now = timezone.now()
                # We can still track if they have an active session
                if user.is_active_session and user.session_started_at:
                    elapsed = now - user.session_started_at
                    if elapsed < timedelta(minutes=1):
                        return Response({
                            'error': 'You already have an active voting session. Please wait or complete your vote.'
                        }, status=status.HTTP_403_FORBIDDEN)

                # Mark session as active
                user.is_active_session = True
                user.session_started_at = now
                user.save(update_fields=['is_active_session', 'session_started_at'])

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

class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_active_session = False
        user.save(update_fields=['is_active_session'])
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class IsAdminUser(permissions.BasePermission):
    """Only allow admin users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin-only viewset for managing users (voters)."""
    queryset = User.objects.filter(is_admin=False).order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.filter(is_admin=False).order_by('-date_joined')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(student_id__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['POST'], parser_classes=[parsers.MultiPartParser])
    def csv_import(self, request):
        """
        Bulk import voters from a CSV file.
        Expected CSV columns: student_id, email, username, password
        Optional columns: course, year_level
        """
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded = csv_file.read().decode('utf-8')
            reader = csv.DictReader(io.StringIO(decoded))

            created_count = 0
            errors = []

            for i, row in enumerate(reader, start=2):  # start=2 because row 1 is the header
                try:
                    student_id = row.get('student_id', '').strip()
                    email = row.get('email', '').strip()
                    # Fallback to 'name' if 'username' is missing, then to email prefix
                    username = row.get('username', row.get('name', '')).strip()
                    if not username and email:
                        username = email.split('@')[0]
                    
                    # Fallback to student_id if password is missing
                    password = row.get('password', student_id).strip()
                    
                    course = row.get('course', '').strip()
                    year_level = row.get('year_level', '').strip()

                    if not all([student_id, email, username, password]):
                        errors.append(f"Row {i}: Missing required fields (student_id and email are mandatory).")
                        continue

                    if User.objects.filter(email=email).exists():
                        errors.append(f"Row {i}: Email '{email}' already exists.")
                        continue
                    if User.objects.filter(student_id=student_id).exists():
                        errors.append(f"Row {i}: Student ID '{student_id}' already exists.")
                        continue

                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        student_id=student_id,
                        course=course,
                        year_level=year_level,
                        is_verified=True,  # CSV-imported users are pre-verified
                        is_voter=True,
                    )
                    created_count += 1
                except Exception as e:
                    errors.append(f"Row {i}: {str(e)}")

            return Response({
                'created': created_count,
                'errors': errors,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Failed to process CSV: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
