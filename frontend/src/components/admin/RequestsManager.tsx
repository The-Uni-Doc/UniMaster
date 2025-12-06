import React from 'react';
import { Check, X } from 'lucide-react';
import { handlePermissionRequest } from '../../services/adminService';
import { PermissionRequest } from '../../types';

interface RequestsManagerProps {
    requests: PermissionRequest[];
    onRefresh: () => void;
}

export const RequestsManager: React.FC<RequestsManagerProps> = ({
    requests,
    onRefresh
}) => {
    const handleReviewRequest = async (id: string, action: 'APPROVE' | 'REJECT') => {
        await handlePermissionRequest(id, action);
        onRefresh();
    };

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No pending permission requests.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h3>
            <ul className="divide-y divide-gray-100">
                {requests.map(req => (
                    <li key={req.id} className="py-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{req.userEmail}</p>
                            <p className="text-xs text-gray-500">Requested: <span className="font-mono text-primary-600">{req.requestedPermission}</span></p>
                            <p className="text-[10px] text-gray-400">{new Date(req.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleReviewRequest(req.id, 'APPROVE')}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                title="Approve"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleReviewRequest(req.id, 'REJECT')}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Reject"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
