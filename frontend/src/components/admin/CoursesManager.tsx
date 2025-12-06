import React, { useState } from 'react';
import { Save, X, Pencil, Trash2 } from 'lucide-react';
import { addCourse, updateCourse, deleteCourse } from '../../services/universityService';
import { hasPermission } from '../../utils/permissions';
import { University, Course, Permission, User } from '../../types';
import { PermissionGate } from '../PermissionGate';

interface CoursesManagerProps {
    currentUser: User;
    isSuperAdmin: boolean;
    unis: University[];
    courses: Course[];
    onRefresh: () => void;
}

export const CoursesManager: React.FC<CoursesManagerProps> = ({
    currentUser,
    isSuperAdmin,
    unis,
    courses,
    onRefresh
}) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemCode, setNewItemCode] = useState('');
    const [selectedUniId, setSelectedUniId] = useState('');

    const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
    const [editCourseName, setEditCourseName] = useState('');
    const [editCourseCode, setEditCourseCode] = useState('');

    const availableUnis = isSuperAdmin
        ? unis
        : unis.filter(u => u.id === currentUser?.assignedUniversityId);

    const displayCourses = isSuperAdmin
        ? courses
        : courses.filter(c => c.universityId === currentUser?.assignedUniversityId);

    const handleAddCourse = async () => {
        if (!newItemName || !selectedUniId) return;
        await addCourse(selectedUniId, newItemName, newItemCode || 'N/A');
        setNewItemName('');
        setNewItemCode('');
        onRefresh();
    };

    const startEditCourse = (course: Course) => {
        setEditingCourseId(course.id);
        setEditCourseName(course.name);
        setEditCourseCode(course.code);
    };

    const handleUpdateCourse = async (id: string) => {
        if (!editCourseName) return;
        await updateCourse(id, editCourseName, editCourseCode);
        setEditingCourseId(null);
        setEditCourseName('');
        setEditCourseCode('');
        onRefresh();
    };

    const handleDeleteCourse = async (id: string) => {
        if (window.confirm("Delete this course?")) {
            await deleteCourse(id);
            onRefresh();
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Course</h3>

            <PermissionGate permission={Permission.MANAGE_COURSES}>
                <div className="space-y-3">
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedUniId}
                        onChange={e => setSelectedUniId(e.target.value)}
                        disabled={!isSuperAdmin && !hasPermission(currentUser, Permission.VIEW_ALL_CONTENT)}
                    >
                        <option value="">Select University</option>
                        {availableUnis.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Course Name"
                        className="w-full p-2 border rounded"
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Course Code (e.g. CS101)"
                        className="w-full p-2 border rounded"
                        value={newItemCode}
                        onChange={e => setNewItemCode(e.target.value)}
                    />
                    <button onClick={handleAddCourse} disabled={!selectedUniId} className="bg-primary-600 text-white px-4 py-2 rounded w-full disabled:opacity-50">Add Course</button>
                </div>
            </PermissionGate>

            <div className="mt-6">
                <h4 className="font-medium mb-2">Courses (Visible):</h4>
                <ul className="divide-y divide-gray-100">
                    {displayCourses.map(c => (
                        <li key={c.id} className="py-2 flex justify-between items-center group min-h-[50px]">
                            {editingCourseId === c.id ? (
                                <div className="flex gap-2 w-full mr-4 items-center">
                                    <input
                                        className="border rounded px-2 py-1 w-20 text-xs"
                                        value={editCourseCode}
                                        onChange={e => setEditCourseCode(e.target.value)}
                                        placeholder="Code"
                                    />
                                    <input
                                        className="border rounded px-2 py-1 flex-1 text-sm"
                                        value={editCourseName}
                                        onChange={e => setEditCourseName(e.target.value)}
                                        placeholder="Name"
                                    />
                                    <button onClick={() => handleUpdateCourse(c.id)} className="text-green-600 p-1"><Save className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingCourseId(null)} className="text-gray-500 p-1"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <span><span className="font-mono text-gray-500 text-xs mr-2">{c.code}</span>{c.name}</span>
                            )}

                            <div className="flex items-center gap-2">
                                {hasPermission(currentUser, Permission.MANAGE_COURSES) && !editingCourseId && (
                                    <>
                                        <button
                                            onClick={() => startEditCourse(c)}
                                            className="text-gray-400 hover:text-blue-500"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(c.id)}
                                            className="text-gray-400 hover:text-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
