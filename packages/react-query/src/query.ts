import { QueryCache } from './queryCache'
import { QueryObserver } from './queryObserver'
import { createRetryer, Retryer } from './retryer'
import { QueryKey, QueryObserverOptions, QueryStatus } from './types'

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
}

export class Query<
  TError = Error,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> {
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

  // 关联 `Query` 与 `QueryObserver`
  addObserver(observer: QueryObserver<any, any, any>) {
    if (!this.#observers.includes(observer)) {
      this.#observers.push(observer)
    }
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

  fetch() {
    // 发起请求函数
    const fetchFn = () => {
      return this.options.queryFn()
    }
    const context = {
      fetchFn,
      options: this.options,
    }

    // 更新状态，通知组件 re-render，这时候 `status` 为 'pending'，组件可以进一步展示正在加载状态时的 UI
    this.#dispatch({ type: 'fetch' })

    this.#retryer = createRetryer({
      fn: context.fetchFn as () => Promise<TData>,
      onSuccess: (data) => {
        // 请求成功后更新状态
        this.#dispatch({
          data,
          type: 'success',
        })
      },
      onError: (error: TError) => {
        // 请求失败后更新状态
        this.#dispatch({
          type: 'error',
          error: error as TError,
        })
      },
    })
    this.#promise = this.#retryer.promise
    return this.#promise
  }
}

function getDefaultState<TData, TError>(): QueryState<TData, TError> {
  return {
    data: undefined as TData,
    status: 'pending',
    error: null,
  }
}
