'use client'

import {useState, useEffect, ChangeEvent} from "react"
import {useRouter} from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/Navbar"
const Cookies = require("universal-cookie")
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface LoginResponse {
  "msg": string,
  "token":string
}

const Login = () => {
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const cookies = new Cookies();
  const router = useRouter();
  const {login, isAuthenticated} = useAuth();

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
          // cookies.set("_auth", token, {path:"/"})
          login(token)
          router.push("/")
          
        })
    } catch(err) {
      console.log(err)
    }
  }
  function handleUsernamechange(event:ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value)
  }

  function handlePasswordChange(event:ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
  }
  return (
    <div>
      <Navbar/>
      <h1>Login</h1>
      <input type="text" name="username" placeholder="Username" onChange={handleUsernamechange}/>
      <input type="password" name="password" placeholder="Password" onChange={handlePasswordChange}/>
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}

export default Login
