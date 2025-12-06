
import { User, UserRole, AuthTokenPayload, Permission, PermissionRequest, PermissionRequestStatus } from '../types';

// Mock Initial Users
const INITIAL_USERS: User[] = [
  {
    id: 'super1',
    email: 'super@unimaster.com',
    role: UserRole.SUPER_ADMIN,
    permissions: [], // Super admin has implicit all access
    passwordHash: 'admin123',
    name: 'Super Admin',
    profession: 'Other'
  },
  {
    id: 'admin1',
    email: 'admin@unimaster.com',
    role: UserRole.ADMIN,
    assignedUniversityId: 'u1', 
    permissions: [Permission.CREATE_MATERIAL, Permission.EDIT_MATERIAL], // Default set
    passwordHash: 'admin123',
    name: 'Test Admin',
    profession: 'Teacher'
  }
];

const STORAGE_KEY_USERS = 'unimaster_users';
const STORAGE_KEY_TOKEN = 'unimaster_auth_token';
const STORAGE_KEY_REQUESTS = 'unimaster_perm_requests';

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Initialize mock users in storage
  init: () => {
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const user = users.find(u => u.email === email && u.passwordHash === password);

    if (user) {
      const tokenPayload: AuthTokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        assignedUniversityId: user.assignedUniversityId,
        enrolledUniversityId: user.enrolledUniversityId,
        enrolledCourseId: user.enrolledCourseId,
        name: user.name,
        iat: Date.now(),
        exp: Date.now() + (1000 * 60 * 60 * 24) 
      };
      
      const token = btoa(JSON.stringify(tokenPayload));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      return true;
    }
    return false;
  },

  // Check if an email is already associated with an admin account
  checkEmailStatus: async (email: string): Promise<{ exists: boolean; role?: UserRole }> => {
      await delay(400);
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
      const user = users.find(u => u.email === email);
      if (user) {
          return { exists: true, role: user.role };
      }
      return { exists: false };
  },

  // Activate an invited admin account by setting a password
  activateAdmin: async (email: string, newPassword: string, profile: { name: string, dob: string, profession: string }): Promise<boolean> => {
      await delay(500);
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex !== -1) {
          users[userIndex].passwordHash = newPassword;
          users[userIndex].name = profile.name;
          users[userIndex].dob = profile.dob;
          // Cast string to specific union type or keep as string if liberal
          users[userIndex].profession = profile.profession as any;
          
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
          return authService.login(email, newPassword);
      }
      return false;
  },

  register: async (
    email: string, 
    password: string, 
    uniId?: string, 
    courseId?: string,
    profile?: { name: string, dob: string, profession: string, otherProfession?: string }
  ): Promise<boolean> => {
    await delay(600);
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    
    if (users.find(u => u.email === email)) {
        throw new Error("Email already in use");
    }

    const newUser: User = {
        id: crypto.randomUUID(),
        email,
        passwordHash: password,
        role: UserRole.STUDENT,
        permissions: [],
        enrolledUniversityId: uniId,
        enrolledCourseId: courseId,
        name: profile?.name,
        dob: profile?.dob,
        profession: profile?.profession as any,
        otherProfession: profile?.otherProfession
    };

    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([...users, newUser]));
    return authService.login(email, password);
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  },

  getCurrentUser: (): AuthTokenPayload | null => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) return null;

    try {
      const payload: AuthTokenPayload = JSON.parse(atob(token));
      // Reload permissions from DB to ensure they are up to date (simulated)
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
      const dbUser = users.find(u => u.id === payload.userId);
      
      if (dbUser) {
          payload.permissions = dbUser.permissions || [];
          payload.role = dbUser.role; // Update role in case it changed
          payload.name = dbUser.name;
      }

      if (Date.now() > payload.exp) {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        return null;
      }
      return payload;
    } catch (e) {
      return null;
    }
  },

  // --- Permission Checking Helper ---
  
  hasPermission: (user: AuthTokenPayload | null, permission: Permission): boolean => {
    if (!user) return false;
    // Super Admin has all permissions implicitly
    if (user.role === UserRole.SUPER_ADMIN) return true;
    // Admins check their explicit list
    return user.permissions.includes(permission);
  },

  // --- Permission Requests ---

  requestPermission: async (permission: Permission): Promise<void> => {
      await delay(300);
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error("Not authenticated");

      const requests: PermissionRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || '[]');
      
      // Check if pending request exists
      const existing = requests.find(r => 
          r.userId === currentUser.userId && 
          r.requestedPermission === permission && 
          r.status === 'PENDING'
      );
      
      if (existing) return; // Already requested

      const newRequest: PermissionRequest = {
          id: crypto.randomUUID(),
          userId: currentUser.userId,
          userEmail: currentUser.email,
          requestedPermission: permission,
          status: 'PENDING',
          timestamp: Date.now()
      };

      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify([...requests, newRequest]));
  },

  getPermissionRequests: async (): Promise<PermissionRequest[]> => {
      await delay(200);
      return JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || '[]');
  },

  hasPendingRequest: (permission: Permission): boolean => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return false;
    
    const requests: PermissionRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || '[]');
    return requests.some(r => 
        r.userId === currentUser.userId && 
        r.requestedPermission === permission && 
        r.status === 'PENDING'
    );
  },

  handlePermissionRequest: async (requestId: string, action: 'APPROVE' | 'REJECT'): Promise<void> => {
      await delay(400);
      const requests: PermissionRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY_REQUESTS) || '[]');
      const reqIndex = requests.findIndex(r => r.id === requestId);
      
      if (reqIndex === -1) throw new Error("Request not found");
      
      const request = requests[reqIndex];
      request.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      
      // If approved, update user permissions
      if (action === 'APPROVE') {
          const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
          const userIndex = users.findIndex(u => u.id === request.userId);
          if (userIndex !== -1) {
              const user = users[userIndex];
              if (!user.permissions.includes(request.requestedPermission)) {
                  user.permissions.push(request.requestedPermission);
                  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
              }
          }
      }

      // Save updated requests
      requests[reqIndex] = request;
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  },

  // --- User Management ---

  getAllUsers: async (): Promise<User[]> => {
    await delay(300);
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    return users.map(({ passwordHash, ...user }) => user as User);
  },

  createUser: async (email: string, role: UserRole, permissions: Permission[], assignedUniversityId?: string): Promise<User> => {
    await delay(300);
    
    // Strict Role Check: Only Super Admins can create users
    const currentUser = authService.getCurrentUser();
    if (currentUser?.role !== UserRole.SUPER_ADMIN) {
        throw new Error("Only Super Admins can create new users.");
    }

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    
    if (users.find(u => u.email === email)) {
      throw new Error("User already exists");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      role,
      permissions: role === UserRole.SUPER_ADMIN ? [] : permissions, // Super admins don't need explicit perms
      assignedUniversityId: role === UserRole.ADMIN ? assignedUniversityId : undefined,
      passwordHash: 'password123'
    };

    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([...users, newUser]));
    return newUser;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");
    if (userId === currentUser.userId) throw new Error("Cannot delete yourself");

    // Strict Role Check: Only Super Admins can delete users
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
        throw new Error("Only Super Admins can delete users.");
    }

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const targetUser = users.find(u => u.id === userId);

    if (!targetUser) throw new Error("User not found");

    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filtered));
  }
};

authService.init();
