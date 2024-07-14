'use client'
import {useState, useEffect, ChangeEvent} from "react"
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  const {links, username, isAuthenticated, addLink} = useAuth();
  const [newLink, setNewLink] = useState<string>("")

  const handleNewLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLink(event.target.value)
  }

  return (
    <div>
      <Navbar/>
      {isAuthenticated ? (
        <div>
          <h1>{`Welcome back, ${username}!`}</h1>
          <input type="text" placeholder="Paste Link here" onChange={handleNewLinkChange}/>
          <button onClick={() => addLink(newLink)}>Add</button>
          {Object.entries(links).map(([key, value]) => (
            <div key={key}>
              <p>{value}</p>
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
