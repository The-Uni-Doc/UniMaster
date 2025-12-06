import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

import { User, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    login: (tokens: { access: string; refresh: string }) => boolean;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // DRF SimpleJWT puts user_id in the token
                setUser({
                    id: decoded.user_id,
                    email: decoded.email,
                    role: decoded.role as UserRole,
                    permissions: []
                });
            } catch (error) {
                console.error('Invalid token', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setLoading(false);
    }, []);

    const login = (tokens: { access: string; refresh: string }) => {
        try {
            localStorage.setItem('access_token', tokens.access);
            localStorage.setItem('refresh_token', tokens.refresh);
            const decoded: any = jwtDecode(tokens.access);
            setUser({
                id: decoded.user_id,
                email: decoded.email,
                role: decoded.role as UserRole,
                permissions: []
            });
            return true;
        } catch (error) {
            console.error('Login failed: Invalid token', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
