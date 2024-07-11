'use client'
import {useState, useEffect, ChangeEvent} from "react"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function Signup() {
  
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  function handleUsernamechange(event:ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value)
  }

  function handlePasswordChange(event:ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
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
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <div>
      <div>
        <h1>Register</h1>
          <input type="text" name="username" placeholder="Username" onChange={handleUsernamechange}/>
          <input type="password" name="password" placeholder="Password" onChange={handlePasswordChange}/>
          <button onClick={signup}>Register</button>
      </div>
    </div>
  );
}

export default Signup

