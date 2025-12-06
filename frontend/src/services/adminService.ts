import api from './api';
import { User, PermissionRequest } from '../types';

export const getAllUsers = async (): Promise<User[]> => {
    const response = await api.get('users/');
    return response.data;
};

export const getPermissionRequests = async (): Promise<PermissionRequest[]> => {
    const response = await api.get('permissions/');
    return response.data;
};

export const createUser = async (email: string, role: string, permissions: string[], assignedUniversityId?: string): Promise<User> => {
    const response = await api.post('users/', { email, role, permissions, assignedUniversityId, password: 'password123' });
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`users/${id}/`);
};

export const handlePermissionRequest = async (id: string, action: 'APPROVE' | 'REJECT'): Promise<void> => {
    const status = action === 'APPROVE' ? 'approved' : 'rejected';
    await api.patch(`permissions/${id}/`, { status });
};
