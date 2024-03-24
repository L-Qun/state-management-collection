/// <reference types="react/experimental" />

import ReactExports, { useReducer, useEffect, useCallback } from 'react'

import { ReadableAtom, WritableAtom } from './atom'
import { useStore } from './store'

const use =
  // 判断react是否包含了use hooks，如果没有的话采用自己实现的方案。
  ReactExports.use ||
  (<T>(
    promise: PromiseLike<T> & {
      status?: 'pending' | 'fulfilled' | 'rejected'
      value?: T
      reason?: unknown
    },
  ): T => {
    if (promise.status === 'pending') {
      throw promise
    } else if (promise.status === 'fulfilled') {
      return promise.value as T
    } else if (promise.status === 'rejected') {
      throw promise.reason
    } else {
      promise.status = 'pending'
      promise.then(
        (v) => {
          promise.status = 'fulfilled'
          promise.value = v
        },
        (e) => {
          promise.status = 'rejected'
          promise.reason = e
        },
      )
      throw promise
    }
  })

const isPromiseLike = (x: any) => typeof x.then === 'function'

export const useSetAtom = <Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
) => {
  // 获取store
  const store = useStore()
  // 用useCallback包裹一层的目的是保持返回的setAtom引用不变
  const setAtom = useCallback(
    (...args: Args) => {
      return store.set(atom, ...args)
    },
    [store, atom],
  )
  return setAtom
}

export const useAtomValue = <Value>(atom: ReadableAtom<Value>) => {
  // 获取store
  const store = useStore()

  const [value, rerender] = useReducer((prev) => {
    const nextValue = store.get(atom)
    if (Object.is(prev, nextValue)) {
      // 状态不变则不触发re-render
      return prev
    }
    return nextValue
  }, store.get(atom))

  useEffect(() => {
    // 订阅组件
    const unsub = store.sub(atom, rerender)
    // 取消订阅
    return unsub
  }, [store, atom])

  return isPromiseLike(value) ? use(value) : value
}

export const useAtom = <Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
) => {
  // useAtom仅仅是调用useAtomValue获取状态，useSetAtom获取更新atom的函数。并返回一个二元组而已。
  return [useAtomValue(atom), useSetAtom(atom)]
}
