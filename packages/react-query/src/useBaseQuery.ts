import { useState, useEffect, useSyncExternalStore, useCallback } from 'react'
import { useQueryClient } from './QueryClientProvider'
import { QueryObserver } from './queryObserver'
import { UseBaseQueryResult, UseBaseQueryOptions } from './types'

export type QueryKey = ReadonlyArray<unknown>

export function useBaseQuery<
  TError = Error,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseBaseQueryOptions<TData, TQueryKey>,
): UseBaseQueryResult<TData, TError> {
  // 通过 hook 拿到 `QueryClient` 实例
  const client = useQueryClient()
  // 在整个组件生命周期中保持 `QueryObserver` 唯一
  const [observer] = useState(
    () => new QueryObserver<TError, TData, TQueryKey>(client, options),
  )

  // 获取查询结果
  const result = observer.getOptimisticResult(options)

  useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        // 订阅，为了当状态更新时通知组件重新渲染
        const unsubscribe = observer.subscribe(onStoreChange)
        return unsubscribe
      },
      [observer],
    ),
    // 可以看到useSyncExternalStore没有用到返回值，所以其实这里就是为了满足类型要求
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult(),
  )

  useEffect(() => {
    // 发起请求
    observer.setOptions(options)
  }, [options, observer])

  return result
}
