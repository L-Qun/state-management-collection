import { useStore } from './store'

export default function App() {
  const todo = useStore.getState().todo
  return <div>todo: {todo}</div>
}
