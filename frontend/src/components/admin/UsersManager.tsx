import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2 } from 'lucide-react';
import { createUser, deleteUser } from '../../services/adminService';
import { User, UserRole, Permission } from '../../types';
import { PermissionGate } from '../PermissionGate';

interface UsersManagerProps {
    currentUser: User;
    users: User[];
    onRefresh: () => void;
}

export const UsersManager: React.FC<UsersManagerProps> = ({
    currentUser,
    users,
    onRefresh
}) => {
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.ADMIN);
    const [newUserUniId, setNewUserUniId] = useState('');
    const [newUserPermissions, setNewUserPermissions] = useState<Permission[]>([]);

    const assignablePermissions = Object.values(Permission);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createUser(newUserEmail, newUserRole, newUserPermissions, newUserUniId || undefined);
            setNewUserEmail('');
            setNewUserUniId('');
            setNewUserPermissions([]);
            onRefresh();
            alert("User created! Default password: password123");
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm("Delete this user?")) {
            try {
                await deleteUser(id);
                onRefresh();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    const toggleNewUserPermission = (perm: Permission) => {
        if (newUserPermissions.includes(perm)) {
            setNewUserPermissions(newUserPermissions.filter(p => p !== perm));
        } else {
            setNewUserPermissions([...newUserPermissions, perm]);
        }
    };

    return (
        <PermissionGate permission={Permission.MANAGE_USERS}>
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary-600" />
                        Create Admin User
                    </h3>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                    value={newUserRole}
                                    onChange={e => setNewUserRole(e.target.value as UserRole)}
                                >
                                    <option value={UserRole.ADMIN}>Admin (Restricted)</option>
                                    <option value={UserRole.SUPER_ADMIN}>Super Admin (Full Access)</option>
                                </select>
                            </div>
                        </div>

                        {newUserRole === UserRole.ADMIN && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign University ID (Optional)</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border"
                                        value={newUserUniId}
                                        onChange={e => setNewUserUniId(e.target.value)}
                                        placeholder="e.g. u1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {assignablePermissions.map(perm => (
                                            <label key={perm} className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={newUserPermissions.includes(perm)}
                                                    onChange={() => toggleNewUserPermission(perm)}
                                                    className="rounded text-primary-600 focus:ring-primary-500"
                                                />
                                                <span>{perm.replace(/_/g, ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
                            Create User
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Users</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                    {u.email[0].toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{u.name || 'Unnamed'}</div>
                                                    <div className="text-sm text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === UserRole.SUPER_ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {u.role === UserRole.SUPER_ADMIN ? (
                                                <span className="flex items-center gap-1 text-purple-600"><ShieldCheck className="w-4 h-4" /> Full Access</span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {u.assignedUniversityId && <span className="text-xs bg-blue-50 text-blue-700 px-1 rounded w-fit">Uni: {u.assignedUniversityId}</span>}
                                                    <span className="text-xs text-gray-400">{u.permissions?.length || 0} permissions</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {u.id !== currentUser.id && (
                                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {u.id === currentUser.id && <span className="text-gray-400 italic text-xs">You</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PermissionGate>
    );
};
