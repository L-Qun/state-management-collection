import { createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

// 创建 Store
export const createTodoStore = (todo) => {
  return createStore()((set) => ({
    todo,
  }))
}

// 创建 React Context，用来分发 Store
export const TodoStoreContext = createContext(undefined)

// 需要将这个 Provider 包裹在组件外面用来创建 Store、填充数据
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

// 在组件中使用该 Hook
export const useTodoStore = (selector) => {
  const todoStoreContext = useContext(TodoStoreContext)

  if (!todoStoreContext) {
    throw new Error(`缺少向 TodoStoreProvider 传入 Store`)
  }

  return useStore(todoStoreContext, selector)
}
