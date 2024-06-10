import { formAction, getTodos } from './actions'

export default async function Home() {
  const todos = await getTodos()

  return (
    <main>
      <form action={formAction}>
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
