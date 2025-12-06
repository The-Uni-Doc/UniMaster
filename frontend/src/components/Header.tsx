import React from 'react';
import { BookOpen, GraduationCap, Shield, User, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { user: currentUser } = useAuth();

  const isStudent = currentUser?.role === UserRole.STUDENT;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">UniMaster</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAdminRoute ? (
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Student View
              </Link>
            ) : (
              <>
                {currentUser ? (
                  <Link
                    to={isStudent ? "/" : "/admin"}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    {isStudent ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    {isStudent ? currentUser.email : "Dashboard"}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/login"
                      className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="hidden sm:flex text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};