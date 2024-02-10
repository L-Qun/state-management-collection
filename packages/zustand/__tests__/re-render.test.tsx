import { act, fireEvent } from '@testing-library/react'
import { render } from '@testing-library/react'
import React from 'react'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import { useShallow } from 'zustand/react/shallow'

type FilterType = 'all' | 'completed' | 'incompleted'

type Todo = {
  id: number
  title: string
  completed: boolean
}

type Store = {
  todos: Array<Todo>
  filter: FilterType
  setFilter: (filter: FilterType) => void
  setTodos: (fn: (todos: Array<Todo>) => Array<Todo>) => void
}

describe('测试re-render', () => {
  it('不加selector', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [{ title: '吃饭', completed: false, id: 0 }],
      setFilter(filter) {
        set({ filter })
      },
      setTodos(fn) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++ // 每次re-render就会增加1
      const { todos } = useStore()
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )
    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    expect(renderCount).toBe(2)
  })

  it('加selector', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [{ title: '吃饭', completed: false, id: 0 }],
      setFilter(filter) {
        set({ filter })
      },
      setTodos(fn) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++ // 每次re-render就会增加1
      const todos = useStore((state) => state.todos)
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )
    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    expect(renderCount).toBe(1)
  })

  it('不加shallow', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [{ title: '吃饭', completed: false, id: 0 }],
      setFilter(filter) {
        set({ filter })
      },
      setTodos(fn) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++ // 每次re-render就会增加1
      const { todos, setFilter } = useStore((state) => ({
        todos: state.todos,
        setFilter: state.setFilter,
      }))
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )
    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    expect(renderCount).toBe(2)
  })

  it('加shallow', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [{ title: '吃饭', completed: false, id: 0 }],
      setFilter(filter) {
        set({ filter })
      },
      setTodos(fn) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++ // 每次re-render就会增加1
      const { todos, setFilter } = useStore(
        (state) => ({
          todos: state.todos,
          setFilter: state.setFilter,
        }),
        shallow,
      )
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )
    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    expect(renderCount).toBe(1)
  })

  it('使用useShallow', async () => {
    const useStore = create<Store>((set) => ({
      filter: 'all',
      todos: [{ title: '吃饭', completed: false, id: 0 }],
      setFilter(filter) {
        set({ filter })
      },
      setTodos(fn) {
        set((prev) => ({ todos: fn(prev.todos) }))
      },
    }))

    let renderCount = 0

    const Display = () => {
      renderCount++ // 每次re-render就会增加1
      const { todos, setFilter } = useStore(
        useShallow((state) => ({
          todos: state.todos,
          setFilter: state.setFilter,
        })),
      )
      return (
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>title: {todo.title}</div>
          ))}
        </div>
      )
    }

    const Control = () => {
      const { setFilter } = useStore()
      return <button onClick={() => setFilter('completed')}>dispatch</button>
    }

    const App = () => (
      <>
        <Display />
        <Control />
      </>
    )
    const { getByText } = render(<App />)
    act(() => {
      fireEvent.click(getByText('dispatch'))
    })
    expect(renderCount).toBe(1)
  })
})
