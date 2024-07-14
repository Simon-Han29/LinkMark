'use client'
import {useState, useEffect, ChangeEvent} from "react"
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  const {links, username, isAuthenticated, addLink, deleteLink} = useAuth();
  const [newLink, setNewLink] = useState<string>("")
  const [newLinkName, setNewLinkName] = useState<string>("")
  const handleNewLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLink(event.target.value.trim())
  }
  const handleNewLinkNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLinkName(event.target.value.trim())
  }
  return (
    <div>
      <Navbar/>
      {isAuthenticated ? (
        <div>
          <h1>{`Welcome back, ${username}!`}</h1>
          <input type="text" placeholder="Paste Link here" onChange={handleNewLinkChange}/>
          <input type="text" placeholder="Link Name" onChange={handleNewLinkNameChange}/>
          <button onClick={() => addLink(newLink, newLinkName)}>Add</button>
          {Object.entries(links).map(([key, data]) => (
            <div key={key}>
              <p>{`${data.linkname}:`}</p> <a href={data.link}>{data.link}</a>
              <button onClick={() => deleteLink(key)}>Delete</button>
            </div>
          ))}
        </div>

      ):(
        <div>
          <h1>Login to start saving links</h1>
        </div>
        
      )}
      
    </div>
  )
}
