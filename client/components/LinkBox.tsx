import React from 'react'

interface Props {
  link:string,
  linkName:string,
  linkId:string
}

const LinkBox:React.FC<Props> = ({link, linkName,linkId}) => {
  return (
    <div className="flex mx-5 w-[80%]">
      <div className="w-[50%]">
        <p>{linkName}</p>
      </div>
      <div className="w-[50%]">
        <p>{link}</p>
      </div>
    </div>
  )
}

export default LinkBox
