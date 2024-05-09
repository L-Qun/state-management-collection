import { QueryKey, UseQueryOptions, UseQueryResult } from './types'
import { useBaseQuery } from './useBaseQuery'

export function useQuery<
  TError = Error, // `useQuery` 返回的 `error` 的类型
  TData = unknown, // `useQuery` 返回的 `data` 的类型
  TQueryKey extends QueryKey = QueryKey, // `queryKey` 的类型
>(options: UseQueryOptions<TData, TQueryKey>): UseQueryResult<TData, TError> {
  return useBaseQuery(options)
}
