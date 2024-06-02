'use client'

import { useState } from 'react'

const Component = () => {
  console.log('re-render')
  return <div>Component</div>
}

// 模拟繁重的 JS 逻辑
function simulateHeavyComputation() {
  console.log('simulateHeavyComputation')
  const start = performance.now()
  while (performance.now() - start < 2) {}
  return 'mock res'
}

export default function Home() {
  const [count, setCount] = useState(0)

  const res = simulateHeavyComputation() // 这里要真正被组件中用到

  return (
    <>
      <span>count: {count} </span>
      <button onClick={() => setCount((count) => count + 1)}>+1</button>
      <Component />
      {res}
    </>
  )
}
