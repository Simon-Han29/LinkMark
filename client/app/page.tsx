'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import LinkBox from "@/components/LinkBox"
import LandingPage from "@/components/LandingPage";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  const { folders, username, isAuthenticated, addLink, deleteLink, createFolder, deleteFolder, numlinks, numfolders } = useAuth();
  const [newLink, setNewLink] = useState<string>("");
  const [newLinkName, setNewLinkName] = useState<string>("");
  const [isLinkMenuShowing, setIsLinkMenuShowing] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [displayedLinks, setDisplayedLinks] = useState<Object>({});
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [isFolderMenuShowing, setIsFolderMenuShowing] = useState<boolean>(false)
  

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

  const toggleLinkMenu = () => {
    setIsLinkMenuShowing(!isLinkMenuShowing);
  };

  const toggleFolderMenu = () => {
    setIsFolderMenuShowing(!isFolderMenuShowing)
  }

  const handleAddLink = async () => {
    let updatedFolder:Object = await addLink(newLink, newLinkName, selectedFolderId);
    setDisplayedLinks(updatedFolder)
    setIsLinkMenuShowing(false)
  };

  const handleDeleteLink = async (linkId:string) => {
    let updatedFolder:Object = await deleteLink(selectedFolderId, linkId)
    setDisplayedLinks(updatedFolder)
  }

  const handleNewFolderNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewFolderName(event.target.value.trim());
  };

  const handleCreateNewFolder = async() => {
    createFolder(newFolderName)
    setIsFolderMenuShowing(false)
  }

  const handleDeleteFolder = async(fid: string) => {
    await deleteFolder(fid)
    if (selectedFolderId === fid) {
      selectedFolderId === ""
      selectedFolder === ""
      setDisplayedLinks({})
    }
    
  }

  return (
    <div className="text-white">
      <Navbar />
      {isAuthenticated ? (
        <div>
          <div className={isLinkMenuShowing || isFolderMenuShowing ? 'opacity-50' : ''}>
            <div className="flex justify-center p-10">
              <Image src="/default-monochrome.svg" alt="" width={400} height={50} />
            </div>
            <div className="flex justify-center mt-8 mb-8">
              <h1>{`Welcome back, ${username}!`}</h1>
            </div>
            <div className="bg-neutral-900 mx-5 h-[400px] p-10 rounded-[20px] mb-5">
              <h1 className="text-center">Dashboard</h1>
              <div className="flex justify-center items-center mt-20">
                <div className="flex flex-col justify-center items-center mx-14">
                  <Image src="/chain.png" alt="" width={75} height={75} className="mb-5"/>
                  {numlinks == 1 ? (
                    <h1>{`${numlinks} Link Saved`}</h1>
                  ): (
                    <h1>{`${numlinks} Links Saved`}</h1>
                  )}
                </div>
                <div className="flex flex-col justify-center items-center mx-14">
                  <Image src="/folder.png" alt="" width={75} height={75} className="mb-5"/>
                  {numfolders == 1 ? (
                    <h1>{`${numfolders} Folder Created`}</h1>
                  ): (
                    <h1>{`${numfolders} Folders Created`}</h1>
                  )}
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="bg-neutral-900 ml-5 p-10 rounded-[20px] w-[30%]">
                <div className="mb-5 flex">
                  <div className="flex items-center w-[80%]">
                    <h1>Folders</h1>
                  </div>
                  <div className="justify-end w-[20%]">
                    <button onClick={toggleFolderMenu} className="bg-violet-600 h-10 w-10 rounded-[5px]">+</button>
                  </div>
                </div>
                
                {folders.map((folder) => (
                  <div key={folder.fid} className={`flex mx-5 rounded-[10px] p-2 ${selectedFolderId===folder.fid ? "bg-neutral-700":""}`}>
                    <div className="flex w-[80%]" onClick={() => selectFolder(folder.name, folder.fid, folder.links)}>
                      <Image src="/folder.png" alt="" width={20} height={20} className="mr-2"/>
                      <div>
                        <p>{folder.name}</p>
                      </div>
                    </div>
                    <div className="w-[20%]">
                      <button onClick={()=>{handleDeleteFolder(folder.fid)}}>Delete</button>
                    </div>
                    
                  </div>
                ))}
              </div>
              <div className="bg-neutral-900 mx-5 p-10 rounded-[20px] w-[70%]">
                <div className="flex mb-5">
                  <div className="w-[80%] flex items-center">
                    <h1>{`/${selectedFolder}`}</h1>
                  </div>
                  <div className="flex justify-end w-[20%]">
                    <button onClick={toggleLinkMenu} className="bg-violet-600 h-10 w-40 rounded-[5px]">Add Link</button>
                  </div>
                </div>
                <div className={`flex mx-5 ${selectedFolder === "" ? "hidden":""}`}>
                  <div className="w-[40%]">
                    <p>Link Name</p>
                  </div>
                  <div className="w-[60%]">
                    <p>URL</p>
                  </div>
                </div>
                <div>
                    {displayedLinks &&
                      Object.values(displayedLinks).map((data) => (
                        <div key={data.linkId} className="bg-neutral-800 flex h-10 items-center rounded-[10px] my-2">
                          <LinkBox link={data.link} linkName={data.linkname} linkId={data.linkId}/>
                          <button onClick={()=>{handleDeleteLink(data.linkId)}}>Delete</button>
                        </div>
                      ))}
                  </div>
              </div>
            </div>
          </div>
          {isLinkMenuShowing ? (
            <div className="bg-neutral-800 absolute left-[50%] top-[50%] h-[300px] w-[500px] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center flex flex-col">
              <div className="flex justify-end w-full pr-10">
                <button onClick={()=>setIsLinkMenuShowing(false)}>Close</button>
              </div>
              <h1>Add Link</h1>
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
          {isFolderMenuShowing ? (
            <div className="bg-neutral-800 absolute left-[50%] top-[50%] h-[300px] w-[500px] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center flex-col">
              <div className="flex justify-end w-full pr-10">
                <button onClick={()=>setIsFolderMenuShowing(false)}>close</button>
              </div>
              <h1>Create New Folder</h1>
              <div className="flex flex-col h-56 w-96 justify-center items-center">
                <input
                  type="text"
                  placeholder="Folder Name"
                  onChange={handleNewFolderNameChange}
                  className="text-black rounded-[5px] px-5 mb-5 h-10"
                />
                <button onClick={handleCreateNewFolder} className="bg-violet-900 h-10 w-28 rounded-[5px]">
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
          <LandingPage/>
        </div>
      )}
    </div>
  );
}
