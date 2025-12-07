import api from './api';
import { UserRole, Permission } from '../types';

export const authService = {
    checkEmailStatus: async (email: string) => {
        const response = await api.post('check-email/', { email });
        // If exists, we assume student for now unless we check role specifically
        // But the requirement is just to check existence for signup flow
        return { exists: response.data.exists, role: UserRole.STUDENT };
    },

    activateAdmin: async (email: string, password: string, profile: any) => {
        try {
            await api.post('activate-admin/', { email, password });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    register: async (email: string, password: string, uniId: string, courseId: string, profile: any) => {
        const response = await api.post('register/', {
            email,
            password,
            username: email, // Django requires username
            enrolledUniversityId: uniId,
            enrolledCourseId: courseId,
            ...profile
        });
        return response.data;
    },

    requestPermission: async (permission: Permission) => {
        const response = await api.post('permissions/', { requestedPermission: permission });
        return response.data;
    },

    hasPendingRequest: (permission: Permission) => {
        // This would ideally check local state or fetch from backend
        return false;
    }
};
