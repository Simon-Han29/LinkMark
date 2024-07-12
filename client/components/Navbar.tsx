import React from 'react'
import Link from "next/link"
import {useAuth} from "@/context/AuthContext"
const Navbar = () => {
  const {isAuthenticated, logout} = useAuth()

  const handleLogout = () => {
    logout();
  }

  return (
    <div>
      <Link href="/">Home</Link>
      <Link href="/signup">Signup</Link>
      {isAuthenticated ? (
        <Link href="/" onClick={handleLogout}>Logout</Link>
      ):(
        <Link href="/login">Login</Link>
      )}      
    </div>
  )
}

export default Navbar
