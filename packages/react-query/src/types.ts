export type QueryKey = ReadonlyArray<unknown>

export type QueryFunction<T = unknown> = (
  queryFnContext: QueryFunctionContext,
) => T | Promise<T>

export type UseQueryOptions<
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = QueryObserverOptions<TData, TQueryKey>

export type UseBaseQueryOptions<
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = QueryObserverOptions<TData, TQueryKey>

export type QueryObserverOptions<
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = {
  queryKey: TQueryKey
  queryFn: QueryFunction<TData>
  retry?: number
  retryDelay?: number
  gcTime?: number
  staleTime?: number
}

export type QueryStatus = 'pending' | 'error' | 'success'

export interface QueryObserverPendingResult {
  data: undefined
  error: null
  isError: false
  isPending: true
  isSuccess: false
  status: 'pending'
}

export interface QueryObserverLoadingErrorResult<TError = Error> {
  data: undefined
  error: TError
  isError: true
  isPending: false
  isSuccess: false
  status: 'error'
}

export interface QueryObserverSuccessResult<TData = unknown> {
  data: TData
  error: null
  isError: false
  isPending: false
  isSuccess: true
  status: 'success'
}

export type UseQueryResult<
  TData = unknown,
  TError = Error,
> = UseBaseQueryResult<TData, TError>

export type UseBaseQueryResult<
  TData = unknown,
  TError = Error,
> = QueryObserverResult<TData, TError>

export type QueryObserverResult<TData = unknown, TError = Error> =
  | QueryObserverSuccessResult<TData>
  | QueryObserverLoadingErrorResult<TError>
  | QueryObserverPendingResult

export type QueryFunctionContext = {
  signal: AbortSignal
}

export interface DefaultOptions {
  queries?: QueryObserverOptions
}

export interface QueryClientConfig {
  defaultOptions?: DefaultOptions
}
