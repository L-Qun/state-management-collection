import { useTodoStore } from './store'

export default function App() {
  const todo = useTodoStore().todo
  return <div>todo: {todo}</div>
}
