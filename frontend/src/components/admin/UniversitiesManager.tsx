import React, { useState } from 'react';
import { Save, X, Pencil, Trash2 } from 'lucide-react';
import { addUniversity, updateUniversity, deleteUniversity } from '../../services/universityService';
import { hasPermission } from '../../utils/permissions';
import { University, Permission, User } from '../../types';
import { PermissionGate } from '../PermissionGate';

interface UniversitiesManagerProps {
    currentUser: User;
    unis: University[];
    onRefresh: () => void;
}

export const UniversitiesManager: React.FC<UniversitiesManagerProps> = ({
    currentUser,
    unis,
    onRefresh
}) => {
    const [newItemName, setNewItemName] = useState('');
    const [editingUniId, setEditingUniId] = useState<string | null>(null);
    const [editUniName, setEditUniName] = useState('');

    const handleAddUni = async () => {
        if (!newItemName) return;
        await addUniversity(newItemName);
        setNewItemName('');
        onRefresh();
    };

    const startEditUni = (uni: University) => {
        setEditingUniId(uni.id);
        setEditUniName(uni.name);
    };

    const handleUpdateUni = async (id: string) => {
        if (!editUniName) return;
        await updateUniversity(id, editUniName);
        setEditingUniId(null);
        setEditUniName('');
        onRefresh();
    };

    const handleDeleteUni = async (id: string) => {
        if (window.confirm("Delete University? This will delete all associated courses.")) {
            await deleteUniversity(id);
            onRefresh();
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Add University</h3>

            <PermissionGate permission={Permission.MANAGE_UNIVERSITIES}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="University Name"
                        className="flex-1 p-2 border rounded"
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                    />
                    <button onClick={handleAddUni} className="bg-primary-600 text-white px-4 py-2 rounded">Add</button>
                </div>
            </PermissionGate>

            <div className="mt-6">
                <h4 className="font-medium mb-2">Existing Universities:</h4>
                <ul className="divide-y divide-gray-100">
                    {unis.map(u => (
                        <li key={u.id} className="py-2 flex justify-between items-center group min-h-[50px]">
                            {editingUniId === u.id ? (
                                <div className="flex gap-2 w-full mr-4">
                                    <input
                                        className="border rounded px-2 py-1 flex-1 text-sm"
                                        value={editUniName}
                                        onChange={e => setEditUniName(e.target.value)}
                                    />
                                    <button onClick={() => handleUpdateUni(u.id)} className="text-green-600 p-1"><Save className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingUniId(null)} className="text-gray-500 p-1"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <span>{u.name}</span>
                            )}

                            <div className="flex items-center gap-2">
                                {hasPermission(currentUser, Permission.MANAGE_UNIVERSITIES) && !editingUniId && (
                                    <>
                                        <button
                                            onClick={() => startEditUni(u)}
                                            className="text-gray-400 hover:text-blue-500"
                                            title="Rename"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUni(u.id)}
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
