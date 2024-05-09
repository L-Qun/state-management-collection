import { QueryCache } from './queryCache'
import { QueryObserver } from './queryObserver'
import { Removable } from './removable'
import { createRetryer, Retryer } from './retryer'
import {
  QueryFunctionContext,
  QueryKey,
  QueryObserverOptions,
  QueryStatus,
} from './types'

interface QueryConfig<TQueryKey extends QueryKey = QueryKey> {
  cache: QueryCache
  queryHash: string
  queryKey: TQueryKey
  options: QueryObserverOptions
}

interface SuccessAction<TData> {
  data: TData | undefined
  type: 'success'
}

interface fetchAction {
  type: 'fetch'
}

interface ErrorAction<TError> {
  type: 'error'
  error: TError
}

export type Action<TData, TError> =
  | SuccessAction<TData>
  | ErrorAction<TError>
  | fetchAction

export interface QueryState<TData = unknown, TError = Error> {
  data: TData | undefined
  status: QueryStatus
  error: TError | null
  dataUpdatedAt: number
}

export class Query<
  TError = Error,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> extends Removable {
  queryKey: TQueryKey
  queryHash: string
  options: QueryObserverOptions
  #promise?: Promise<TData>
  #cache: QueryCache
  state: QueryState<TData, TError>
  #retryer?: Retryer<TData>
  #initialState: QueryState<TData, TError>
  #observers: Array<QueryObserver>

  constructor(config: QueryConfig<TQueryKey>) {
    super()

    this.queryHash = config.queryHash
    this.queryKey = config.queryKey
    this.options = config.options
    this.#cache = config.cache
    // 初始化状态
    this.#initialState = getDefaultState()
    // 实际存放状态的地方
    this.state = this.#initialState
    // 保存 `QueryObserver` 实例，一个 `Query` 可能对应多个 `QueryObserver`，通过数组将他们关联起来
    this.#observers = []
  }

  // 取消请求
  cancel() {
    this.#retryer?.cancel()
  }

  // 关联 `Query` 与 `QueryObserver`
  addObserver(observer: QueryObserver<any, any, any>) {
    if (!this.#observers.includes(observer)) {
      this.#observers.push(observer)
    }
  }

  // 判断数据是否 `stale` (过期)
  isStaleByTime(staleTime = 0): boolean {
    return (
      this.state.data === undefined ||
      this.state.dataUpdatedAt + staleTime < Date.now()
    )
  }

  #dispatch(action: Action<TData, TError>): void {
    const reducer = (
      state: QueryState<TData, TError>,
    ): QueryState<TData, TError> => {
      switch (action.type) {
        case 'success': {
          return {
            ...state,
            data: action.data,
            status: 'success', // 代表数据请求成功
            dataUpdatedAt: Date.now(), // 记录下更新状态的时间，用来对比数据是否 `stale`
          }
        }
        case 'fetch': {
          return {
            ...state,
            status: 'pending', // 正在请求数据中
          }
        }
        case 'error': {
          const error = action.error
          return {
            ...state,
            error: error,
            status: 'error', // 发生错误
          }
        }
      }
    }
    // 更新状态
    this.state = reducer(this.state)
    // 触发组件 re-render
    this.#observers.forEach((observer) => {
      observer.updateResult()
    })
  }

  fetch(options?: QueryObserverOptions<TData, TQueryKey>) {
    if (options) {
      this.options = options
    }

    // 更新 `query` 回收时间
    this.updateGcTime(this.options.gcTime)

    // 用于取消请求
    const abortController = new AbortController()

    const queryFnContext: QueryFunctionContext = {
      signal: abortController.signal,
    }

    // 发起请求函数
    const fetchFn = () => {
      return this.options.queryFn(queryFnContext)
    }
    const context = {
      fetchFn,
      options: this.options,
    }

    // 更新状态，通知组件 re-render，这时候 `status` 为 'pending'，组件可以进一步展示正在加载状态时的 UI
    this.#dispatch({ type: 'fetch' })

    this.#retryer = createRetryer({
      fn: context.fetchFn as () => Promise<TData>,
      abort: abortController.abort.bind(abortController),
      onSuccess: (data) => {
        // 请求成功后更新状态
        this.#dispatch({
          data,
          type: 'success',
        })
        // 请求成功后调度 `scheduleGc` 来垃圾回收
        this.scheduleGc()
      },
      onError: (error: TError) => {
        // 请求失败后更新状态
        this.#dispatch({
          type: 'error',
          error: error as TError,
        })
      },
      // 重试次数
      retry: context.options.retry,
      // 重试间隔时间
      retryDelay: context.options.retryDelay,
    })
    this.#promise = this.#retryer.promise
    return this.#promise
  }

  protected optionalRemove() {
    this.#cache.remove(this)
  }
}

function getDefaultState<TData, TError>(): QueryState<TData, TError> {
  return {
    dataUpdatedAt: Date.now(),
    data: undefined as TData,
    status: 'pending',
    error: null,
  }
}
