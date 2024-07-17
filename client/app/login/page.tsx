'use client'

import {useState, useEffect, ChangeEvent} from "react"
import {useRouter} from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/Navbar"
import Image from "next/image"
import Link from "next/link"
const Cookies = require("universal-cookie")
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface LoginResponse {
  "msg": string,
  "token":string,
  "folders": FolderType[]
}

interface FolderType {
  fid: string,
  uid: string,
  parentid: string | null | undefined,
  name: string,
  links: LinkType[]
}

interface LinkType {
  name: string,
  link: string
}

const Login = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const cookies = new Cookies();
  const router = useRouter();
  const {login, isAuthenticated, initFolders} = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [])

  function handleLogin() {
    try {
      console.log(BASE_URL)
      fetch(`${BASE_URL}/login`, {
        "method": "POST",
        "headers": {
          "content-type": "application/json"
        },
        "body": JSON.stringify({
          "username": username,
          "password": password
        })
      })
        .then((res) => {
          if (res.status === 201) {
            return res.json()
          } else if (res.status === 404) {

          } else {

          }
        })
        .then((data:LoginResponse) => {
          const token = data.token
          const folders:FolderType[] = data.folders
          login(token)
          initFolders(folders)
          
          router.push("/")
          
        })
    } catch(err) {
      console.log(err)
    }
  }
  function handleUsernamechange(event:ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value.trim())
  }

  function handlePasswordChange(event:ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value.trim())
  }
  return (
    <div className="h-screen text-white">
      <Navbar/>
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="border border-black flex flex-col items-center h-[500px] w-[350px] bg-neutral-900 rounded-[15px] drop-shadow-2xl">
          <div className=" mt-20 mb-10">
            <Image src="/default-monochrome.svg" alt="" width={200} height={50}/>
          </div>
          <div className="flex flex-col items-center">
            <input type="text" name="username" placeholder="Username" onChange={handleUsernamechange} className="outline-none mb-5 h-10 rounded-[5px] border border-black p-5 text-black"/>
            <input type="password" name="password" placeholder="Password" onChange={handlePasswordChange} className="outline-none mb-5 h-10 rounded-[5px] border border-black p-5 text-black"/>
            <button onClick={handleLogin} className="bg-violet-600 hover:bg-violet-900 h-10 w-40 rounded-[5px] text-white">Login</button>
          </div>
          <div className="mt-10">
            <Link href="/signup">{"Don't have an account yet? Sign up"}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
