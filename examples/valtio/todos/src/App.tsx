import { Radio } from 'antd'
import { FormEvent } from 'react'
import { proxy, useSnapshot } from 'valtio'
import { a, useTransition } from '@react-spring/web'
import { CloseOutlined } from '@ant-design/icons'

type FilterType = 'all' | 'completed' | 'incompleted'
type Todo = {
  id: number
  title: string
  completed: boolean
}

export const store = proxy<{ filter: FilterType; todos: Todo[] }>({
  filter: 'all',
  todos: [],
})

const addTodo = (title: string) => {
  store.todos.push({
    id: Date.now(),
    title,
    completed: false,
  })
}

const setTodos = (fn: (todos: Array<Todo>) => Array<Todo>) => {
  store.todos = fn(store.todos)
}

const setFilter = (filter: FilterType) => {
  store.filter = filter
}

const TodoItem = ({ item }: { item: Todo }) => {
  const { title, completed, id } = item

  const toggleCompleted = () =>
    setTodos((prevTodos) =>
      prevTodos.map((prevItem) =>
        prevItem.id === id ? { ...prevItem, completed: !completed } : prevItem,
      ),
    )

  const remove = () => {
    setTodos((prevTodos) => prevTodos.filter((prevItem) => prevItem.id !== id))
  }

  return (
    <>
      <input type="checkbox" checked={completed} onChange={toggleCompleted} />
      <span style={{ textDecoration: completed ? 'line-through' : '' }}>
        {title}
      </span>
      <CloseOutlined onClick={remove} />
    </>
  )
}

const Filter = () => {
  const { filter } = useSnapshot(store)

  return (
    <Radio.Group onChange={(e) => setFilter(e.target.value)} value={filter}>
      <Radio value="all">All</Radio>
      <Radio value="completed">Completed</Radio>
      <Radio value="incompleted">Incompleted</Radio>
    </Radio.Group>
  )
}

const Filtered = () => {
  const { todos, filter } = useSnapshot(store)
  const filterTodo = todos.filter((todo) => {
    if (filter === 'all') return true
    if (filter === 'completed') return todo.completed
    return !todo.completed
  })
  const transitions = useTransition(filterTodo, {
    keys: (todo) => todo.id,
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: 40 },
    leave: { opacity: 0, height: 0 },
  })

  return transitions((style, item) => (
    <a.div className="item" style={style}>
      <TodoItem item={item} />
    </a.div>
  ))
}

const App = () => {
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const title = e.currentTarget.inputTitle.value
    e.currentTarget.inputTitle.value = ''
    addTodo(title)
  }

  return (
    <form onSubmit={add}>
      <Filter />
      <input name="inputTitle" placeholder="Type ..." />
      <Filtered />
    </form>
  )
}

export default App
