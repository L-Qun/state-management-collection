import { bigFunc } from '@/lib/bigFunc'

export default async function ServerPage() {
  console.log('Server Component Render')

  const todos = await fetch('https://jsonplaceholder.typicode.com/todos').then(
    (res) => res.json() as Promise<any[]>,
  )

  bigFunc()

  return (
    <>
      <h1>Server Page</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </>
  )
}
