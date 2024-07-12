'use client'
import {useState, useEffect, ChangeEvent} from "react"
import Navbar from "@/components/Navbar"
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Home() {
  return (
    <div>
      <Navbar/>
    </div>
  )
}
