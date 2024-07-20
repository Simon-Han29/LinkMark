'use client'
import React from 'react'
import Image from "next/image"
const LandingPage = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Image src="/default-monochrome.svg" alt="" width={800} height={100}/>
      <div className="flex mt-20">
        <div className="h-48 w-48 flex flex-col justify-center items-center">
          <div className="h-36 w-36 flex justify-center items-center rounded-full bg-teal-900 mb-4">
            <Image src="/chain.png" alt="" width={100} height={100}/>  
          </div>
          <h1>Save Links</h1>
        </div>
        <div className="h-48 w-48 flex flex-col justify-center items-center">
          <div className="h-36 w-36 flex justify-center items-center rounded-full bg-teal-900 mb-4">
            <Image src="/folder.png" alt="" width={100} height={100}/>  
          </div>
          <h1>Organize Them</h1>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
