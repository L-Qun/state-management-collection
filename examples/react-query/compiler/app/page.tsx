"use client"

import { useState } from "react"

const Component = () => {
  console.log('re-render')
  return <div>Component</div>
}

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <span>count: {count} </span>
      <button onClick={() => setCount(count => count + 1)}>+1</button>
      <Component />
    </>
  )
}