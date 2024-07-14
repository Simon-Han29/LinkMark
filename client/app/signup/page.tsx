'use client'
import {useState, useEffect, ChangeEvent} from "react"
import { useAuth,  } from "@/context/AuthContext"
import {useRouter} from "next/navigation"
import Navbar from "@/components/Navbar"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function Signup() {
  
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const router = useRouter();
  const {isAuthenticated} = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [])

  function handleUsernamechange(event:ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value.trim())
  }

  function handlePasswordChange(event:ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value.trim())
  }

  function signup() {
    try {
      console.log(BASE_URL)
      fetch(`${BASE_URL}/signup`, {
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
        if(res.status === 201) {
          router.push("/login")
        }
      })
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <div className="h-screen text-white">
      <Navbar/>
      <div className="flex items-center justify-center h-[calc(100vh-56px)]">
        <div className="border border-black flex flex-col items-center h-[500px] w-[350px] bg-neutral-900 rounded-[15px] drop-shadow-2xl">
          <div>
            <h1 className="mt-20 mb-10">Register</h1>
          </div>
          <div className="flex flex-col items-center">
            <input type="text" name="username" placeholder="Username" onChange={handleUsernamechange} className="outline-none mb-5 h-10 rounded-[5px] border border-black p-5 text-black"/>
            <input type="password" name="password" placeholder="Password" onChange={handlePasswordChange} className="outline-none mb-5 h-10 rounded-[5px] border border-black p-5 text-black"/>
            <button onClick={signup} className="bg-violet-600 hover:bg-violet-900 h-10 w-40 rounded-[5px] text-white">Register</button>
          </div>
          <div className="mt-10">
            <p>{"Already have an account? Login"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup

