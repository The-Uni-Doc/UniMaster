import { User, UserRole, Permission } from '../types';

export const hasPermission = (user: User | null, permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;
    return user.permissions?.includes(permission) || false;
};
