import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMaterials, uploadMaterial, Material } from '../services/materialService';
import { useAuth } from '../context/AuthContext';

export const MaterialsView: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const { user } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload Form State
    const [title, setTitle] = useState('');
    const [fileType, setFileType] = useState('other');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, [courseId]);

    const fetchMaterials = async () => {
        if (courseId) {
            try {
                const data = await getMaterials(parseInt(courseId));
                setMaterials(data);
            } catch (error) {
                console.error('Failed to fetch materials', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !courseId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('course', courseId);
        formData.append('file', file);
        formData.append('file_type', fileType);

        try {
            await uploadMaterial(formData);
            alert('Material uploaded successfully! It will be visible after approval.');
            setShowUploadModal(false);
            setTitle('');
            setFile(null);
            // Optionally fetch materials again, though pending ones won't show up yet
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload material.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading materials...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
                </div>
                {user && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Upload Material
                    </button>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {materials.map((material) => (
                        <li key={material.id}>
                            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        {/* Icon based on file type */}
                                        {material.file_type === 'lecture' ? '📄' :
                                            material.file_type === 'exam' ? '📝' :
                                                material.file_type === 'assignment' ? '📋' : '📁'}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-blue-600 truncate">
                                            <a href={material.file} target="_blank" rel="noopener noreferrer">
                                                {material.title}
                                            </a>
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Uploaded by {material.uploaded_by_email} on {new Date(material.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${material.file_type === 'exam' ? 'bg-red-100 text-red-800' :
                                            material.file_type === 'lecture' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {material.file_type.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                    {materials.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No materials found for this course yet. Be the first to upload!
                        </li>
                    )}
                </ul>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Upload Material</h2>
                        <form onSubmit={handleUpload}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                >
                                    <option value="lecture">Lecture Notes</option>
                                    <option value="exam">Exam Paper</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">File</label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    required
                                    className="mt-1 block w-full"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
