'use client'
import {useState, useEffect, ChangeEvent} from "react"
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar"
import Image from "next/image"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  const {links, username, isAuthenticated, addLink, deleteLink} = useAuth();
  const [newLink, setNewLink] = useState<string>("")
  const [newLinkName, setNewLinkName] = useState<string>("")
  const [isMenuShowing, setIsMenuShowing] = useState<boolean>(false)
  const handleNewLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLink(event.target.value.trim())
  }
  const handleNewLinkNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLinkName(event.target.value.trim())
  }

  const toggleMenu = () => {
    if(isMenuShowing) {
      setIsMenuShowing(false)
    } else {
      setIsMenuShowing(true)
    }
  }
  return (
    <div className="text-white">
      <Navbar/>
      {isAuthenticated ? (
        <div>
          <div className={isMenuShowing ? "opacity-50": ""}>
            <div className={`flex justify-center p-10`}>
              <Image src="/default-monochrome.svg" alt="" width={400} height={50}/>
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
              </div>
              <div className="bg-neutral-900 mx-5 p-10 rounded-[20px] w-[70%]">
                <div className="flex justify-end">
                  <button onClick={toggleMenu} className="bg-violet-600 h-10 w-40 rounded-[5px]">+ New</button>
                </div>
                
                {Object.entries(links).map(([key, data]) => (
                  <div key={key}>
                    <p>{`${data.linkname}:`}</p><a href={data.link}>{data.link}</a>
                    <button onClick={() => deleteLink(key)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {isMenuShowing ? (
              <div className="bg-neutral-800 absolute left-[50%] top-[50%] h-[300px] w-[500px] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center">
                <div className="flex flex-col h-56 w-96 justify-center items-center">
                  <input type="text" placeholder="Paste Link here" onChange={handleNewLinkChange} className="text-black rounded-[5px] px-5 mb-5 h-10"/>
                  <input type="text" placeholder="Link Name" onChange={handleNewLinkNameChange} className="text-black rounded-[5px] px-5 mb-5 h-10"/>
                  <button onClick={() => addLink(newLink, newLinkName)} className="bg-violet-900 h-10 w-28 rounded-[5px]">Add</button>
                </div>
              </div>
            ):(<></>)}
        </div>

      ):(
        <div>
          <h1>Login to start saving links</h1>
        </div>
        
      )}
      
    </div>
  )
}
