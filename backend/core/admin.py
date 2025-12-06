from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, University, Course, Material, PermissionRequest

admin.site.register(User)
admin.site.register(University)
admin.site.register(Course)
admin.site.register(Material)
admin.site.register(PermissionRequest)
