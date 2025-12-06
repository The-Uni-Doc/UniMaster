from rest_framework import serializers
from .models import User, University, Course, Material, PermissionRequest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name')

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    university_name = serializers.ReadOnlyField(source='university.name')

    class Meta:
        model = Course
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.ReadOnlyField(source='uploaded_by.email')
    course_name = serializers.ReadOnlyField(source='course.name')

    class Meta:
        model = Material
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'status', 'created_at')

class PermissionRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    university_name = serializers.ReadOnlyField(source='university.name')

    class Meta:
        model = PermissionRequest
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        
        if user.is_superuser:
            token['role'] = 'super_admin'
        elif user.is_staff:
            token['role'] = 'admin'
        else:
            token['role'] = 'student'
            
        return token
