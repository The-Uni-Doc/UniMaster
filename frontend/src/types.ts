
export enum MaterialCategory {
  NOTES = 'Notes',
  FLASHCARDS = 'Flashcards',
  PAST_PAPERS = 'Past Papers',
  PRACTICE_QUESTIONS = 'Practice Questions',
  OTHER = 'Other'
}

export interface University {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  universityId: string;
  name: string;
  code: string;
}

export interface Year {
  id: string;
  courseId: string;
  yearNumber: number; // e.g., 2023, 2024
}

export interface Material {
  id: string;
  yearId: string; // Links to a specific year of a course
  title: string;
  category: MaterialCategory;
  fileUrl: string; // Placeholder for cloud storage URL
  description?: string;
  uploadedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- Auth Types ---

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STUDENT = 'student'
}

// Granular Permissions
export enum Permission {
  CREATE_MATERIAL = 'create_material',
  EDIT_MATERIAL = 'edit_material',
  DELETE_MATERIAL = 'delete_material',
  MANAGE_COURSES = 'manage_courses', // Create/Delete courses
  MANAGE_UNIVERSITIES = 'manage_universities', // Create/Delete unis
  MANAGE_USERS = 'manage_users', // Create/Delete admins
  VIEW_ALL_CONTENT = 'view_all_content' // See content outside assigned uni
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[]; // List of specific allowed actions
  assignedUniversityId?: string; // Only used for 'admin' role
  enrolledUniversityId?: string; // For students
  enrolledCourseId?: string; // For students
  passwordHash?: string; // Stored in DB, never sent to frontend in real app
  
  // Profile Fields
  name?: string;
  dob?: string;
  profession?: 'Student' | 'Teacher' | 'Other';
  otherProfession?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  assignedUniversityId?: string;
  enrolledUniversityId?: string;
  enrolledCourseId?: string;
  iat: number;
  exp: number;
  name?: string;
}

export type PermissionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PermissionRequest {
  id: string;
  userId: string;
  userEmail: string;
  requestedPermission: Permission;
  status: PermissionRequestStatus;
  timestamp: number;
}
