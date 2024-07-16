'use client'

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
  addLink: (link: string, linkName: string, fid:string) => Object;
  deleteLink: (linkId: string) => void;
}

interface LinkType {
  name: string,
  link: string
}

interface FolderType {
    fid: string,
    uid: string,
    parentid: string | null | undefined,
    name: string,
    links: LinkType
}

interface JWTType {
  username: string;
  folders: FolderType[];
  uid: string
  iat: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [username, setUsername] = useState<string>("");
  const [uid, setUid] = useState<string>("");

  useEffect(() => {
    const token = cookies.get('token');
    console.log('Token:', token);

    if (token != undefined) {
      const parts = token.split('.');
      console.log('Token parts:', parts.length);

      if (parts.length === 3) {
        try {
          const decoded: JWTType = jwtDecode(token);
          setFolders(decoded.folders);
          setUsername(decoded.username);
          setUid(decoded.uid)
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token decode error:', error);
          cookies.remove('token', { path: '/' });
          setFolders([]);
          setUsername('');
          setUid("")
          setIsAuthenticated(false);
        }
      } else {
        console.error('Invalid token format');
        cookies.remove('token', { path: '/' });
        setFolders([]);
        setUsername('');
        setUid("");
        setIsAuthenticated(false);
      }
    } else {
      setFolders([]);
      setUsername('');
      setIsAuthenticated(false);
      setUid("")
    }
  }, []);

  const addLink = async (link: string, linkName: string, fid:string) => {
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
            username: username,
            link: link,
            linkName: linkName,
            fid: fid,
            uid: uid
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to add link');
        }
  
        // Assuming your API returns updated folders structure
        const data = await response.json();
        setFolders(data.folders); // Update the folders state with the updated data
        console.log(data.folders)
        let returned = {};
        for (let i = 0; i < data.folders.length; i++) {
          if (data.folders[i].fid === fid) {
            returned = data.folders[i].links
          } 
        }
        return returned
  
      } catch (error) {
        console.error('Error adding link:', error);
      }
    }
  };
  
  const deleteLink = async (linkId: string) => {
    if (isAuthenticated) {
      try {
        const token = cookies.get('token');
        const response = await fetch(`${BASE_URL}/links`, {
          method: 'DELETE',
          headers: {
            'content-type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            username: username,
            linkId: linkId,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete link');
        }
  
        // Assuming your API returns updated folders structure
        const data = await response.json();
        setFolders(data.folders); // Update the folders state with the updated data
  
      } catch (error) {
        console.error('Error deleting link:', error);
      }
    }
  };
  

  const login = (token: string) => {
    try {
      const parts = token.split('.');
      console.log('Login token parts:', parts.length);

      if (parts.length === 3) {
        cookies.set('token', token, { path: '/' });
        const decoded: JWTType = jwtDecode(token);
        setFolders(decoded.folders);
        setUsername(decoded.username);
        console.log(decoded.uid)
        setUid(decoded.uid)
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Token decode error during login:', error);
      setFolders([]);
      setUsername('');
      setUid("")
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    cookies.remove('token', { path: '/' });
    setFolders([]);
    setUsername('');
    setUid("")
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, folders, username, uid, login, logout, addLink, deleteLink }}>
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
