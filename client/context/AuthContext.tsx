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
  numlinks: number;
  numfolders:number;
  login: (token: string) => void;
  logout: () => void;
  addLink: (link: string, linkName: string, fid: string) => Object;
  deleteLink: (fid:string, linkId: string) => Object;
  initFolders: (folders: FolderType[]) => void;
  createFolder: (folderName:string) => void;
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
  links: LinkType[]
}

interface JWTType {
  username: string;
  uid: string;
  iat: string;
}

interface UserStats {
  numlinks: number,
  numfolders: number
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
  const [numlinks, setnumlinks] = useState<number>(0)
  const [numfolders, setnumfolders] = useState<number>(1)

  const resetSessionData = () => {
    cookies.remove('token', { path: '/' });
    setFolders([]);
    setUsername('');
    setUid('');
    setnumlinks(0)
    setnumfolders(1)
    setIsAuthenticated(false);
  }

  const fetchFolders = async (token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/folders`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data: FolderType[] = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchUserStats = async(token: string) => {
    try {
      const response = await fetch(`${BASE_URL}/userStats`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data: UserStats = await response.json();
      setnumlinks(data.numlinks)
      setnumfolders(data.numfolders)
    } catch(err) {

    }
  }
  useEffect(() => {
    const token = cookies.get('token');
    console.log('Token:', token);

    if (token) {
      const parts = token.split('.');
      console.log('Token parts:', parts.length);

      if (parts.length === 3) {
        try {
          const decoded: JWTType = jwtDecode(token);
          setUsername(decoded.username);
          setUid(decoded.uid);
          setIsAuthenticated(true);
          fetchFolders(token);
          fetchUserStats(token)
        } catch (error) {
          console.error('Token decode error:', error);
          resetSessionData()
        }
      } else {
        console.error('Invalid token format');
        resetSessionData()
      }
    } else {
      resetSessionData()
    }
  }, []);

  const addLink = async (link: string, linkName: string, fid: string) => {
    if (isAuthenticated) {
      try {
        const token = cookies.get('token');
        const response = await fetch(`${BASE_URL}/links`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
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

        const data = await response.json();
        setFolders(data.folders);
        setnumlinks(numlinks+1)
        let returned = {};
        for (let i = 0; i < data.folders.length; i++) {
          if (data.folders[i].fid === fid) {
            returned = data.folders[i].links;
          }
        }
        return returned;

      } catch (error) {
        console.error('Error adding link:', error);
      }
    }
  };

  const deleteLink = async (fid: string, linkId: string) => {
    if (isAuthenticated) {
      try {
        const token = cookies.get('token');
        const response = await fetch(`${BASE_URL}/links`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({
            "uid":uid,
            "linkId": linkId,
            "fid":fid
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete link');
        }
        const data = await response.json();
        setFolders(data.folders);
        setnumlinks(numlinks-1)

        let returned = {};
        for (let i = 0; i < data.folders.length; i++) {
          if (data.folders[i].fid === fid) {
            returned = data.folders[i].links;
          }
        }
        return returned;

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
        setUsername(decoded.username);
        setUid(decoded.uid);
        setIsAuthenticated(true);
        fetchFolders(token);
      } else {
        throw new Error('Invalid token format');
      }
    } catch (error) {
      console.error('Token decode error during login:', error);
      setFolders([]);
      setUsername('');
      setUid('');
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    cookies.remove('token', { path: '/' });
    setFolders([]);
    setUsername('');
    setUid('');
    setIsAuthenticated(false);
  };

  const initFolders = (folders: FolderType[]) => {
    setFolders(folders);
  };

  const createFolder = async (folderName:string) => {
    try {
      if (isAuthenticated) {
        fetch(`${BASE_URL}/folders`, {
          "method": "POST",
          "headers": {
            "authorization": cookies.get("token"),
            "content-type": "application/json"
          },
          "body": JSON.stringify({
            "folderName": folderName,
            "uid": uid
          })
        })
        .then((res) => {
          if (res.status === 201) {
            return res.json()
          }
        })
        .then((data) => {
          setFolders(data.folders)
          setnumfolders(numfolders+1)
          return data.folders;
        })
      }
    } catch(err) {

    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, folders, username, uid, numlinks, numfolders, login, logout, addLink, deleteLink, initFolders, createFolder }}>
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
