'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
const Cookies = require("universal-cookie");

const cookies = new Cookies();

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        const token = cookies.get('token');
        setIsAuthenticated(!!token);
    }, []);

    const login = (token: string) => {
        cookies.set('token', token, { path: '/' });
        setIsAuthenticated(true);
    };

    const logout = () => {
        cookies.remove('token', { path: '/' });
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
