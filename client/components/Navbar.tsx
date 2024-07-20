import React from 'react'
import Link from "next/link"
import {useAuth} from "@/context/AuthContext"
const Navbar = () => {
  const {isAuthenticated, logout} = useAuth()

  const handleLogout = () => {
    logout();
  }

  return (
    <div className="bg-neutral-900 h-14 flex text-white">
      <div className="mx-10 w-[80%] flex items-center">
        <Link href="/">Home</Link>
      </div>
      {isAuthenticated ? (
        <div className="flex justify-end items-center w-[20%]">
          <Link href="/" onClick={handleLogout} className="mr-10">Logout</Link>
        </div>
        
      ):(
        <div className="flex justify-end items-center w-[20%]">
          <div>
            <Link href="/signup" className="mr-10">Sign up</Link>
          </div>
          <div>
            <Link href="/login" className="mr-10">Login</Link>
          </div>              
        </div>

      )}      
    </div>
  )
}

export default Navbar
