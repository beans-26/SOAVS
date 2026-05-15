from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, LogoutView, RegisterView, VerifyOTPView, AdminUserViewSet

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('', include(router.urls)),
]
