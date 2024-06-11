'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetch('/api/todos')
      .then((res) => res.json())
      .then(({ todos }) => setTodos(todos))
  }, [])

  async function onSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // 清空表单数据
    event.currentTarget.reset()

    // 提交表单
    const response = await fetch('/api/todos', {
      method: 'POST',
      body: formData,
    })
    const { todos } = await response.json()

    // 更新状态
    setTodos(todos)
  }

  return (
    <main>
      <form onSubmit={onSubmit}>
        <input type="text" name="todo" />
        <button type="submit">提交</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </main>
  )
}
