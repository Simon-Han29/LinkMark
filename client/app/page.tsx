'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  const { folders, username, isAuthenticated, addLink, deleteLink, initFolders } = useAuth();
  const [newLink, setNewLink] = useState<string>('');
  const [newLinkName, setNewLinkName] = useState<string>('');
  const [isMenuShowing, setIsMenuShowing] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [displayedLinks, setDisplayedLinks] = useState<Object>({});

  const handleNewLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLink(event.target.value.trim());
  };

  const handleNewLinkNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLinkName(event.target.value.trim());
  };

  const selectFolder = (folderName: string, folderId: string, links: Object) => {
    setSelectedFolder(folderName);
    setSelectedFolderId(folderId);
    setDisplayedLinks(links);
  };

  const toggleMenu = () => {
    setIsMenuShowing(!isMenuShowing);
  };

  const handleAddLink = async () => {
    let updatedFolder:Object = await addLink(newLink, newLinkName, selectedFolderId);
    // Update displayedLinks after adding a new link
    setDisplayedLinks(updatedFolder)
  };

  return (
    <div className="text-white">
      <Navbar />
      {isAuthenticated ? (
        <div>
          <div className={isMenuShowing ? 'opacity-50' : ''}>
            <div className="flex justify-center p-10">
              <Image src="/default-monochrome.svg" alt="" width={400} height={50} />
            </div>
            <div className="flex justify-center mt-8 mb-8">
              <h1>{`Welcome back, ${username}!`}</h1>
            </div>
            <div className="bg-neutral-900 mx-5 h-[400px] p-10 rounded-[20px] mb-5">
              <h1 className="text-center">Dashboard</h1>
            </div>
            <div className="flex">
              <div className="bg-neutral-900 ml-5 p-10 rounded-[20px] w-[30%]">
                <p>Folders</p>
                {folders.map((folder) => (
                  <div key={folder.fid}>
                    <p onClick={() => selectFolder(folder.name, folder.fid, folder.links)}>{folder.name}</p>
                  </div>
                ))}
              </div>
              <div className="bg-neutral-900 mx-5 p-10 rounded-[20px] w-[70%] flex">
                <div className="w-[80%] flex items-center">
                  <p>{`/${selectedFolder}`}</p>
                </div>
                <div className="flex justify-end w-[20%]">
                  <button onClick={toggleMenu} className="bg-violet-600 h-10 w-40 rounded-[5px]">
                    + New Link
                  </button>
                  <div>
                    {displayedLinks &&
                      Object.values(displayedLinks).map((data) => (
                        <div key={data.linkId}>
                          <p>{data.link}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isMenuShowing ? (
            <div className="bg-neutral-800 absolute left-[50%] top-[50%] h-[300px] w-[500px] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center">
              <div className="flex flex-col h-56 w-96 justify-center items-center">
                <input
                  type="text"
                  placeholder="Paste Link here"
                  onChange={handleNewLinkChange}
                  className="text-black rounded-[5px] px-5 mb-5 h-10"
                />
                <input
                  type="text"
                  placeholder="Link Name"
                  onChange={handleNewLinkNameChange}
                  className="text-black rounded-[5px] px-5 mb-5 h-10"
                />
                <button onClick={handleAddLink} className="bg-violet-900 h-10 w-28 rounded-[5px]">
                  Add
                </button>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div>
          <h1>Login to start saving links</h1>
        </div>
      )}
    </div>
  );
}
