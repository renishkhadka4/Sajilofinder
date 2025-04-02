from django.urls import path
from .views import RegisterView, VerifyOTPView, LoginView
from .views import UserProfileUpdateView, ChangePasswordView,UserProfileView
from .views import send_reset_email, reset_password
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),  # ✅ GET & UPDATE profile
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),  # ✅ Change password
    path("password/forgot/", send_reset_email, name="send-reset-email"),
    path("password/reset/", reset_password, name="reset-password"),
    
]