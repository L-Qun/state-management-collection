import { useRef, useEffect, useMemo, useSyncExternalStore } from 'react'

import { snapshot, subscribe } from './vanilla'
import { createProxy, isChanged } from './proxy-compare'

export function useSnapshot<T extends object>(proxyObject: T): T {
  const affected = useMemo(() => new WeakMap<object, unknown>(), [proxyObject])
  const lastSnapshot = useRef<T>()
  const currSnapshot = useSyncExternalStore(
    (callback) => {
      // 进行订阅
      const unsub = subscribe(proxyObject, callback)
      return unsub
    },
    () => {
      // client，当状态变化时会调用这个函数，拿到新的状态，对比新旧状态是否一致来决定是否re-render
      const nextSnapshot = snapshot(proxyObject) // 生成新的状态
      if (
        lastSnapshot.current &&
        !isChanged(lastSnapshot.current, nextSnapshot, affected) // 对比前后状态在使用的属性上是否变化
      ) {
        return lastSnapshot.current // 如果关心的状态没有变化，则返回上次的状态，不会触发re-render
      }
      return nextSnapshot
    },
    // server
    () => snapshot(proxyObject),
  )

  useEffect(() => {
    lastSnapshot.current = currSnapshot
  })

  // 借助 `createProxy` 生成一个 proxy，追踪属性使用情况，避免组件没用到的状态变化造成组件re-render
  return createProxy(currSnapshot, affected)
}
