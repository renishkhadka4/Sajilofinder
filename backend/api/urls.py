from django.urls import path
from .views import (
    RegisterView, VerifyOTPView, LoginView,
    UserProfileUpdateView, ChangePasswordView, UserProfileView,
    send_reset_email, reset_password
)

urlpatterns = [
    # User registration
    path('register/', RegisterView.as_view(), name='register'),

    # Verify OTP after registration
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),

    # User login
    path('login/', LoginView.as_view(), name='login'),

    # Get or update user profile
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),

    # Change password while logged in
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Request password reset link via email
    path("password/forgot/", send_reset_email, name="send-reset-email"),

    # Reset password using reset link
    path("password/reset/", reset_password, name="reset-password"),
]
