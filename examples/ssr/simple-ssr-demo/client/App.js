import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <div>count: {count}</div>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </>
  )
}
