import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, BookOpen, School, Users, LogOut, Database, Bell, Lock } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getUniversities, getCourses } from '../services/universityService';
import { getAllMaterials } from '../services/materialService';
import { getAllUsers, getPermissionRequests } from '../services/adminService';
import { University, Course, Material, User, UserRole, PermissionRequest } from '../types';

// Sub-components
import { MaterialsManager } from '../components/admin/MaterialsManager';
import { CoursesManager } from '../components/admin/CoursesManager';
import { UniversitiesManager } from '../components/admin/UniversitiesManager';
import { UsersManager } from '../components/admin/UsersManager';
import { RequestsManager } from '../components/admin/RequestsManager';

type ViewMode = 'MATERIALS' | 'COURSES' | 'UNIS' | 'USERS' | 'REQUESTS';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('MATERIALS');

    // Data State
    const [unis, setUnis] = useState<University[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<PermissionRequest[]>([]);

    const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

    // Optimized Data Loading
    const loadViewData = useCallback(async () => {
        if (!currentUser) return;

        // Always load basic context for dropdowns when needed
        if (['MATERIALS', 'COURSES', 'USERS'].includes(viewMode)) {
            const u = await getUniversities();
            setUnis(u);
        }

        if (['MATERIALS', 'COURSES'].includes(viewMode)) {
            const c = await getCourses();
            setCourses(c);
        }

        // Specific fetches based on view
        if (viewMode === 'MATERIALS') {
            const m = await getAllMaterials();
            setMaterials(m);
        } else if (viewMode === 'USERS' && isSuperAdmin) {
            const usr = await getAllUsers();
            setUsers(usr);
        } else if (viewMode === 'REQUESTS' && isSuperAdmin) {
            const reqs = await getPermissionRequests();
            setRequests(reqs.filter(r => r.status === 'PENDING'));
        }
    }, [viewMode, currentUser, isSuperAdmin]);

    useEffect(() => {
        // Auth Check
        if (!currentUser) {
            navigate('/login');
            return;
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        loadViewData();
    }, [loadViewData]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary-600" />
                        Admin Panel
                    </h2>
                    <div className="mt-4 flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-gray-900 truncate">{currentUser.email}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{currentUser.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    <button
                        onClick={() => setViewMode('MATERIALS')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${viewMode === 'MATERIALS' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Upload className="mr-3 h-5 w-5" />
                        Materials
                    </button>

                    <button
                        onClick={() => setViewMode('COURSES')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${viewMode === 'COURSES' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <BookOpen className="mr-3 h-5 w-5" />
                        Courses
                    </button>

                    <button
                        onClick={() => setViewMode('UNIS')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${viewMode === 'UNIS' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <School className="mr-3 h-5 w-5" />
                        Universities
                    </button>

                    <button
                        onClick={() => setViewMode('USERS')}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors justify-between ${viewMode === 'USERS' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center">
                            <Users className="mr-3 h-5 w-5" />
                            Users
                        </div>
                        {!isSuperAdmin && <Lock className="w-3 h-3 text-gray-400" />}
                    </button>

                    {isSuperAdmin && (
                        <button
                            onClick={() => setViewMode('REQUESTS')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors justify-between ${viewMode === 'REQUESTS' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center">
                                <Bell className="mr-3 h-5 w-5" />
                                Requests
                            </div>
                            {requests.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {requests.length}
                                </span>
                            )}
                        </button>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen bg-gray-50/50">
                <div className="max-w-5xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {viewMode === 'MATERIALS' && 'Manage Study Materials'}
                            {viewMode === 'COURSES' && 'Manage Courses'}
                            {viewMode === 'UNIS' && 'Manage Universities'}
                            {viewMode === 'USERS' && 'Manage Admin Users'}
                            {viewMode === 'REQUESTS' && 'Permission Requests'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {viewMode === 'MATERIALS' && 'Upload and manage content for students.'}
                            {viewMode === 'COURSES' && 'Add or edit courses.'}
                            {viewMode === 'USERS' && 'Create new admins and assign permissions.'}
                            {viewMode === 'REQUESTS' && 'Approve or deny access requests from admins.'}
                        </p>
                    </div>

                    {viewMode === 'MATERIALS' && (
                        <MaterialsManager
                            currentUser={currentUser}
                            isSuperAdmin={isSuperAdmin}
                            unis={unis}
                            courses={courses}
                            materials={materials}
                            onRefresh={loadViewData}
                        />
                    )}

                    {viewMode === 'UNIS' && (
                        <UniversitiesManager
                            currentUser={currentUser}
                            unis={unis}
                            onRefresh={loadViewData}
                        />
                    )}

                    {viewMode === 'COURSES' && (
                        <CoursesManager
                            currentUser={currentUser}
                            isSuperAdmin={isSuperAdmin}
                            unis={unis}
                            courses={courses}
                            onRefresh={loadViewData}
                        />
                    )}

                    {viewMode === 'USERS' && (
                        <UsersManager
                            currentUser={currentUser}
                            users={users}
                            onRefresh={loadViewData}
                        />
                    )}

                    {viewMode === 'REQUESTS' && isSuperAdmin && (
                        <RequestsManager
                            requests={requests}
                            onRefresh={loadViewData}
                        />
                    )}

                </div>
            </main>
        </div>
    );
};