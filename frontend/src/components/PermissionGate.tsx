
import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/permissions';
import { Permission } from '../types';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional custom fallback
  showDefaultFallback?: boolean; // Whether to show the default "Request Permission" UI
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
  showDefaultFallback = true
}) => {
  const { user } = useAuth();
  const hasAccess = hasPermission(user, permission);
  const [requestStatus, setRequestStatus] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE');

  useEffect(() => {
    // Check if a request is already pending for this permission
    if (!hasAccess && user) {
      const isPending = authService.hasPendingRequest(permission);
      if (isPending) {
        setRequestStatus('SENT');
      }
    }
  }, [hasAccess, permission, user]);

  const handleRequest = async () => {
    setRequestStatus('SENDING');
    try {
      await authService.requestPermission(permission);
      setRequestStatus('SENT');
    } catch (e) {
      console.error(e);
      setRequestStatus('IDLE');
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  // If user doesn't have access
  if (showDefaultFallback) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center max-w-lg mx-auto my-4 shadow-sm">
        <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Lock className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600 mb-6">
          Sorry, you require Super Admin permission to view or edit this.
        </p>

        {requestStatus === 'SENT' ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
            <CheckCircle className="w-4 h-4" />
            Request Sent
          </div>
        ) : (
          <button
            onClick={handleRequest}
            disabled={requestStatus === 'SENDING'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            {requestStatus === 'SENDING' ? 'Sending...' : 'Request Permission'}
            <AlertTriangle className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return <>{fallback}</>;
};
