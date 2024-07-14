'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {jwtDecode} from "jwt-decode"
const Cookies = require("universal-cookie");
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL


const cookies = new Cookies();

interface AuthContextType {
    isAuthenticated: boolean;
    links: Object,
    username: string
    login: (token: string) => void;
    logout: () => void;
    addLink: (link:string) => void;
}

interface JWTType {
    username: string,
    links: Object,
    iat: string,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [links, setLinks] = useState<Object>({});
    const [username, setUsername] = useState<string>("");
    useEffect(() => {
        const token = cookies.get('token');
        
        if (token) {
            const decoded:JWTType = jwtDecode(token);
            setLinks(decoded.links)
            setUsername(decoded.username)
            setIsAuthenticated(true);
        } else {
            setLinks({})
            setUsername("")
            setIsAuthenticated(false);
        }
    }, []);

    const addLink = async (link: string) => {
        if (isAuthenticated) {
            fetch(`${BASE_URL}/links`, {
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "Authorization": cookies.get("token")
                },
                "body": JSON.stringify({
                    "username": username,
                    "link": link,
                })
            })
                .then((res) => {
                    if (res.status === 201) {
                        return res.json();
                    } else {
                        return null;
                    }
                })
                .then((data) => {
                    setLinks(data)
                })
        }
    }

    const login = (token: string) => {
        cookies.set('token', token, { path: '/' });
        const decoded:JWTType = jwtDecode(token);
        setLinks(decoded.links)
        setUsername(decoded.username)
        setIsAuthenticated(true);
    };

    const logout = () => {
        cookies.remove('token', { path: '/' });
        setLinks({})
        setUsername("")
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, links, username, login, logout, addLink }}>
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
