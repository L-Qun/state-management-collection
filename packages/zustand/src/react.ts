import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector'

type Subscribe = Parameters<typeof useSyncExternalStoreWithSelector>[0]

type GetState<T> = () => T

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
) => void

type StoreApi<T> = {
  setState: SetState<T>
  getState: GetState<T>
  subscribe: Subscribe
}

type StateCreator<T> = (setState: SetState<T>) => T

type EqualityFn<T> = (a: T, b: T) => boolean

/**
 * `createStore` 用来创建Store
 */
const createStore = <T>(createState: StateCreator<T>): StoreApi<T> => {
  const listeners = new Set<(state: T) => void>()
  let state: T // store内部状态存储于state上
  const setState: SetState<T> = (partial) => {
    // setState就是create接收函数的入参
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: T) => T)(state)
        : partial
    if (!Object.is(nextState, state)) {
      state =
        typeof nextState !== 'object' || nextState === null
          ? (nextState as T)
          : Object.assign({}, state, nextState)
      // 当状态发生变化时，依次通知组件re-render，也就是循环调用一遍listeners的所有函数
      listeners.forEach((listener) => listener(state))
    }
  }
  const getState = () => state
  const subscribe: Subscribe = (subscribe) => {
    // 每次订阅时将subscribe加入到listeners，subscribe的作用是触发组件重新渲染
    listeners.add(subscribe)
    return () => listeners.delete(subscribe)
  }
  const api = { setState, getState, subscribe }
  state = createState(setState) // state的初始值就是createState的调用结果
  return api
}

/**
 * `useStore` 借助 `useSyncExternalStoreWithSelector` 完成订阅、状态选取、re-render优化，返回选取的状态
 */
const useStore = <State, StateSlice>(
  api: StoreApi<State>,
  selector: (state: State) => StateSlice = api.getState as any,
  equalityFn?: EqualityFn<StateSlice>,
) => {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getState,
    selector,
    equalityFn,
  )
  return slice
}

export const create = <T>(createState: StateCreator<T>) => {
  const api = createStore(createState) // 拿到store，包含了全部操作store的方法
  const useBoundStore = <TSlice = T>(
    selector?: (state: T) => TSlice,
    equalityFn?: EqualityFn<TSlice>,
  ) => useStore<T, TSlice>(api, selector, equalityFn)
  Object.assign(useBoundStore, api)
  return useBoundStore as typeof useBoundStore & StoreApi<T>
}
