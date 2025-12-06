import api from './api';
import { UserRole, Permission } from '../types';

export const authService = {
    checkEmailStatus: async (email: string) => {
        // TODO: Implement backend endpoint
        return { exists: false, role: UserRole.STUDENT };
    },

    activateAdmin: async (email: string, password: string, profile: any) => {
        // TODO: Implement backend endpoint
        return true;
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
