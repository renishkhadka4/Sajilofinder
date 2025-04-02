from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, VerifyOTPSerializer, LoginSerializer
from rest_framework.decorators import api_view
from rest_framework.views import APIView
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Account verified successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from django.contrib.auth import get_user_model

CustomUser = get_user_model()  # ✅ Ensure CustomUser is imported

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # ✅ Fetch user manually
            user = CustomUser.objects.filter(email=email).first()
            
            if user and user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'role': user.role,  
                    'username': user.username  
                }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import generics, permissions
from .serializers import UserProfileSerializer, ChangePasswordSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user  # ✅ Returns the authenticated user

    def put(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)  # ✅ Partial update allowed

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully!"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
from rest_framework import status
from rest_framework.views import APIView  # ✅ Add this import


class ChangePasswordView(APIView):
    """
    API endpoint for changing user password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({"message": "Password updated successfully!"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for retrieving and updating user profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user  # ✅ Returns the authenticated user
    

    from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.conf import settings
from .models import CustomUser

# In-memory store for simplicity (you can use model or cache in prod)
RESET_TOKENS = {}

@api_view(['POST'])
def send_reset_email(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = CustomUser.objects.get(email=email)
        token = get_random_string(30)
        RESET_TOKENS[token] = {"user_id": user.id, "expires_at": timezone.now() + timezone.timedelta(minutes=15)}

        reset_link = f"http://localhost:3000/reset-password/{token}/"  # 🔁 Adjust frontend URL
        send_mail(
            "Reset Your Password",
            f"Click the link to reset your password:\n\n{reset_link}\n\nThis link expires in 15 minutes.",
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False
        )
        return Response({"message": "Reset email sent!"})
    except CustomUser.DoesNotExist:
        return Response({"error": "User with this email does not exist"}, status=404)

@api_view(['POST'])
def reset_password(request):
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    if not token or not new_password:
        return Response({"error": "Token and new password are required"}, status=400)

    token_data = RESET_TOKENS.get(token)
    if not token_data or timezone.now() > token_data["expires_at"]:
        return Response({"error": "Invalid or expired token"}, status=400)

    try:
        user = CustomUser.objects.get(id=token_data["user_id"])
        user.set_password(new_password)
        user.save()

        # Clean up used token
        del RESET_TOKENS[token]

        return Response({"message": "Password reset successful!"})
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
