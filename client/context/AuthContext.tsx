'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';
const Cookies = require('universal-cookie');
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const cookies = new Cookies();

interface AuthContextType {
  isAuthenticated: boolean;
  folders: FolderType[];
  username: string;
  uid: string;
  login: (token: string) => void;
  logout: () => void;
  addLink: (link: string, linkName: string, fid: string) => void;
  deleteLink: (linkId: string) => void;
}

interface LinkType {
  name: string;
  link: string;
}

interface FolderType {
  fid: string;
  uid: string;
  parentid: string | null | undefined;
  name: string;
  links: LinkType[];
}

interface JWTType {
  username: string;
  folders: FolderType[];
  uid: string;
  iat: string;
}

interface RefreshResponseType {
  msg: string;
  token: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [username, setUsername] = useState<string>('');
  const [uid, setUid] = useState<string>('');

  const refreshToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: cookies.get('token'),
        },
        body: JSON.stringify({
          username,
          uid,
        }),
      });

      if (response.status === 201) {
        const data: RefreshResponseType = await response.json();
        const token = data.token;
        cookies.remove('token', { path: '/' });
        cookies.set('token', token, { path: '/' });
        const decoded: JWTType = jwtDecode(token);
        setFolders(decoded.folders);
        setUsername(decoded.username);
        setUid(decoded.uid);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      cookies.remove('token', { path: '/' });
      setFolders([]);
      setUsername('');
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    async function updateState() {
      const token = cookies.get('token');
      if (token) {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Error updating state:', error);
          cookies.remove('token', { path: '/' });
          setFolders([]);
          setUsername('');
          setIsAuthenticated(false);
        }
      } else {
        setFolders([]);
        setUsername('');
        setIsAuthenticated(false);
      }
    }
    updateState();
  }, []);

  const addLink = async (link: string, linkName: string, fid: string) => {
    console.log("username: " + username)
    console.log("uid: " + uid)
    console.log("isAuth:" + isAuthenticated)
    if (isAuthenticated) {
      try {
        const token = cookies.get('token');
        const response = await fetch(`${BASE_URL}/links`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            "linkName": linkName,
            "link": link,
            "fid": fid,
            "uid": uid
          }),
        });

        if (response.status === 201) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Error adding link:', error);
      }
    }
  };

  const deleteLink = async (linkId: string) => {
    if (isAuthenticated) {
      try {
        const token = cookies.get('token');
        const response = await fetch(`${BASE_URL}/links/${linkId}`, {
          method: 'DELETE',
          headers: {
            Authorization: token,
          },
        });

        if (response.status === 200) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Error deleting link:', error);
      }
    }
  };

  const login = (token: string) => {
    cookies.set('token', token, { path: '/' });
    const decoded: JWTType = jwtDecode(token);
    setFolders(decoded.folders);
    console.log("Running login")
    setUsername(decoded.username);
    setUid(decoded.uid);
    setIsAuthenticated(true);
  };

  const logout = () => {
    cookies.remove('token', { path: '/' });
    setFolders([]);
    setUsername('');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, folders, username, uid, login, logout, addLink, deleteLink }}
    >
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
