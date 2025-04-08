from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsStudentOrOwner(BasePermission):
    """
    Allows access only to users with role 'Student' or 'HostelOwner'
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        role = getattr(request.user, 'role', '').strip().lower()
        return role in ['student', 'hostelowner']
