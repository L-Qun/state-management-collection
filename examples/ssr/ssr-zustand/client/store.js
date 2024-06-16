import { createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

// export const useStore = create((set) => ({
//   todo: null,
// }))

export const createTodoStore = (todo) => {
  return createStore()((set) => ({
    todo,
  }))
}

export const TodoStoreContext = createContext(undefined)

export const TodoStoreProvider = ({ children, todo }) => {
  const storeRef = useRef()
  if (!storeRef.current) {
    storeRef.current = createTodoStore(todo)
  }

  return (
    <TodoStoreContext.Provider value={storeRef.current}>
      {children}
    </TodoStoreContext.Provider>
  )
}

export const useTodoStore = (selector) => {
  const todoStoreContext = useContext(TodoStoreContext)

  if (!todoStoreContext) {
    throw new Error(`缺少向 TodoStoreProvider 传入 Store`)
  }

  return useStore(todoStoreContext, selector)
}
