import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2, FileCheck } from 'lucide-react';
import { addMaterial, updateMaterial, deleteMaterial } from '../../services/materialService';
import { getYears, ensureYearsForCourse } from '../../services/universityService';
import { hasPermission } from '../../utils/permissions';
import { University, Course, Year, Material, MaterialCategory, Permission, User } from '../../types';
import { MaterialCard } from '../MaterialCard';
import { PermissionGate } from '../PermissionGate';

interface MaterialsManagerProps {
    currentUser: User;
    isSuperAdmin: boolean;
    unis: University[];
    courses: Course[];
    materials: Material[];
    onRefresh: () => void;
}

export const MaterialsManager: React.FC<MaterialsManagerProps> = ({
    currentUser,
    isSuperAdmin,
    unis,
    courses,
    materials,
    onRefresh
}) => {
    // Local State for Form
    const [selectedUniId, setSelectedUniId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedYearId, setSelectedYearId] = useState('');
    const [years, setYears] = useState<Year[]>([]);

    // Material Form State
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
    const [newMatTitle, setNewMatTitle] = useState('');
    const [newMatCategory, setNewMatCategory] = useState<MaterialCategory>(MaterialCategory.NOTES);
    const [newMatDesc, setNewMatDesc] = useState('');

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [existingFileUrl, setExistingFileUrl] = useState('');

    // Filtered Lists
    const availableUnis = isSuperAdmin
        ? unis
        : unis.filter(u => u.id === currentUser?.assignedUniversityId);

    const displayCourses = isSuperAdmin
        ? courses
        : courses.filter(c => c.universityId === currentUser?.assignedUniversityId);

    // Load years when course selected
    useEffect(() => {
        if (selectedCourseId) {
            const loadYears = async () => {
                await ensureYearsForCourse(selectedCourseId);
                const y = await getYears(selectedCourseId);
                setYears(y);
            }
            loadYears();
        } else {
            setYears([]);
        }
    }, [selectedCourseId]);

    const resetMaterialForm = () => {
        setNewMatTitle('');
        setNewMatDesc('');
        setNewMatCategory(MaterialCategory.NOTES);
        setEditingMaterialId(null);
        setSelectedFile(null);
        setExistingFileUrl('');
        setIsUploading(false);
        // Optional: Reset selections? Maybe keep them for faster entry.
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSaveMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedYearId || !newMatTitle || !selectedCourseId) return;

        const formData = new FormData();
        formData.append('title', newMatTitle);
        formData.append('category', newMatCategory);
        formData.append('description', newMatDesc);
        formData.append('course', selectedCourseId);
        // formData.append('yearId', selectedYearId); // Backend doesn't support yearId yet, but frontend uses it for filtering.

        if (selectedFile) {
            formData.append('file', selectedFile);
            formData.append('file_type', 'other'); // Or derive from extension
        }

        try {
            if (editingMaterialId) {
                await updateMaterial(editingMaterialId, formData);
                alert("Material updated successfully!");
            } else {
                if (!selectedFile) {
                    alert("Please select a file to upload.");
                    return;
                }
                await addMaterial(formData);
                alert("Material added successfully!");
            }
            resetMaterialForm();
            onRefresh();
        } catch (error) {
            console.error("Failed to save material:", error);
            alert("Failed to save material. Please try again.");
        }
    };

    const handleEditMaterial = (material: Material) => {
        setEditingMaterialId(material.id);
        setNewMatTitle(material.title);
        setNewMatDesc(material.description || '');
        setNewMatCategory(material.category);
        setExistingFileUrl(material.fileUrl);
        setSelectedFile(null);

        // We need to set the dropdowns to match this material
        // This is tricky because we need to find the course and uni from the yearId
        // For now, we'll just set the yearId and hope the user doesn't change the course dropdowns invalidly
        // Ideally we should look up the hierarchy.
        // Let's try to find the year object to get courseId
        // But we might not have all years loaded.
        // For simplicity in this refactor, we will just set the form values.
        // If the user wants to change the location, they might need to re-select.

        setSelectedYearId(material.yearId);

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMaterial = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this material?")) {
            await deleteMaterial(id);
            onRefresh();
            if (editingMaterialId === id) resetMaterialForm();
        }
    };

    return (
        <div className="space-y-8">
            <PermissionGate permission={Permission.CREATE_MATERIAL}>
                <div className={`bg-white p-6 rounded-xl shadow-sm border ${editingMaterialId ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            {editingMaterialId ? <Pencil className="w-5 h-5 text-primary-600" /> : <Plus className="w-5 h-5 text-primary-600" />}
                            {editingMaterialId ? 'Edit Material' : 'Add New Material'}
                        </h3>
                        {editingMaterialId && (
                            <button onClick={resetMaterialForm} className="text-sm text-gray-500 hover:text-gray-700">Cancel Edit</button>
                        )}
                    </div>

                    <form onSubmit={handleSaveMaterial} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">University</label>
                                <select
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                    value={selectedUniId}
                                    onChange={e => {
                                        setSelectedUniId(e.target.value);
                                        setSelectedCourseId('');
                                    }}
                                    required
                                    disabled={!isSuperAdmin && !hasPermission(currentUser, Permission.VIEW_ALL_CONTENT)}
                                >
                                    <option value="">Select University</option>
                                    {availableUnis.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Course</label>
                                <select
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                    disabled={!selectedUniId}
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {displayCourses.filter(c => c.universityId === selectedUniId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Year</label>
                                <select
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                    value={selectedYearId}
                                    onChange={e => setSelectedYearId(e.target.value)}
                                    disabled={!selectedCourseId}
                                    required
                                >
                                    <option value="">Select Year</option>
                                    {years.map(y => <option key={y.id} value={y.id}>Year {y.yearNumber}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-4 pt-4"></div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Material Title</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                value={newMatTitle}
                                onChange={e => setNewMatTitle(e.target.value)}
                                required
                                placeholder="e.g. Week 1 Lecture Notes"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                    value={newMatCategory}
                                    onChange={e => setNewMatCategory(e.target.value as MaterialCategory)}
                                >
                                    {Object.values(MaterialCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (Google Drive)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-300 rounded-lg cursor-pointer"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                                    />
                                </div>
                                {selectedFile && (
                                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                        <FileCheck className="w-3 h-3" /> Ready to upload: {selectedFile.name}
                                    </p>
                                )}
                                {!selectedFile && existingFileUrl && (
                                    <p className="mt-1 text-xs text-gray-500 truncate">
                                        Current: <a href={existingFileUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">View File</a>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                rows={3}
                                value={newMatDesc}
                                onChange={e => setNewMatDesc(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading to Google Drive...
                                </>
                            ) : (
                                <>
                                    {editingMaterialId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingMaterialId ? 'Update Material' : 'Publish Material'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </PermissionGate>

            {/* List of existing materials */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Recent Materials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.slice().reverse().slice(0, 6).map(m => (
                        <div key={m.id} className="relative group">
                            <MaterialCard
                                material={m}
                                isAdmin
                                onDelete={
                                    hasPermission(currentUser, Permission.DELETE_MATERIAL)
                                        ? handleDeleteMaterial
                                        : undefined
                                }
                                onEdit={
                                    hasPermission(currentUser, Permission.EDIT_MATERIAL)
                                        ? handleEditMaterial
                                        : undefined
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
