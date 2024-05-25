'use client'

import { bigFunc } from '@/lib/bigFunc'
import { useEffect, useState } from 'react'

export default function ClientPage() {
  console.log('Client Component Render')

  const [todos, setTodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  bigFunc()

  useEffect(() => {
    setLoading(true)
    setTodos([])
    setError(false)

    const controller = new AbortController()

    fetch('https://jsonplaceholder.typicode.com/todos', {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setTodos(data)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(true)
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  if (loading) return <div>loading...</div>

  if (error) return <div>Error</div>

  return (
    <>
      <h1>Client Page</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </>
  )
}
