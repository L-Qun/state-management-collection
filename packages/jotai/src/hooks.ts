import { useReducer, useEffect, useCallback } from 'react'

import { ReadableAtom, WritableAtom } from './atom'
import { useStore } from './store'

export const useSetAtom = <Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
) => {
  // 获取store
  const store = useStore()
  // 用useCallback包裹一层的目的是保持api引用不变
  const setAtom = useCallback((...args: Args) => {
    // 如果是read-only atom则报错
    if (!('write' in atom)) {
      throw new Error('not writable atom')
    }
    return store.set(atom, ...args)
  }, [])
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

  return value
}

export const useAtom = <Value, Args extends unknown[], Result>(
  atom: WritableAtom<Value, Args, Result>,
) => {
  // useAtom仅仅是调用useAtomValue获取状态，useSetAtom获取更新atom的函数。并返回一个二元组而已。
  return [useAtomValue(atom), useSetAtom(atom)]
}
