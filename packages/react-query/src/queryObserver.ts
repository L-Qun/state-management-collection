import { Query } from './query'
import { QueryClient } from './queryClient'
import { Subscribable } from './subscribable'
import { QueryKey, QueryObserverOptions, QueryObserverResult } from './types'
import { shallowEqualObjects } from './utils'

export class QueryObserver<
  TError = Error,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> extends Subscribable {
  #client: QueryClient
  #currentResult: QueryObserverResult<TData, TError> = undefined!
  #currentQuery: Query = undefined!

  constructor(
    client: QueryClient,
    public options: QueryObserverOptions,
  ) {
    super()
    //  保存 `Query` 实例
    this.#client = client
  }

  setOptions(options?: QueryObserverOptions<TData, TQueryKey>) {
    this.options = options ?? this.options
    const prevQuery = this.#currentQuery
    // 构造 `query`
    this.#updateQuery()
    if (prevQuery !== this.#currentQuery) {
      // 发起请求
      this.#executeFetch()
    }
  }

  // 判断状态是否变化，如果有变化则通知组件 re-renders
  updateResult() {
    const prevResult = this.#currentResult
    const nextResult = this.createResult(this.#currentQuery)
    // 浅层比较
    if (shallowEqualObjects(nextResult, prevResult)) {
      return
    }
    this.#currentResult = nextResult
    // 通知组件re-render
    this.#notify()
  }

  // 执行异步请求逻辑
  #executeFetch() {
    const promise = this.#currentQuery.fetch()
    return promise
  }

  // 获取查询结果
  getOptimisticResult(
    options: QueryObserverOptions<TData, TQueryKey>,
  ): QueryObserverResult<TData, TError> {
    // `build` 实现中会判断 `queryKey` 对应是否有 `query`，有的话会直接拿缓存，不会重复构建
    const query = this.#client.getQueryCache().build(options)
    // 构造返回结果
    const result = this.createResult(query)
    return result
  }

  getCurrentResult(): QueryObserverResult<TData, TError> {
    return this.#currentResult
  }

  createResult(query: Query): QueryObserverResult<TData, TError> {
    // 从 `Query` 实例中获取状态
    const { state } = query
    const { data, status } = state

    // 根据 `status` 生成 `isPending`、`isError`、`isSuccess`
    const isPending = status === 'pending'
    const isError = status === 'error'
    const isSuccess = status === 'success'

    const result = {
      data,
      status,
      isPending,
      isError,
      isSuccess,
    }

    return result as QueryObserverResult<TData, TError>
  }

  #notify() {
    this.listeners.forEach((listener) => {
      // re-render 组件
      listener()
    })
  }

  #updateQuery(): void {
    const query = this.#client.getQueryCache().build(this.options)
    if (query === this.#currentQuery) {
      return
    }
    this.#currentQuery = query
    // 一个 `query` 可能会对应多个 `QueryObserver` 实例，因此需要保存到 `query` 上
    // 方便当状态更新时可以借助 `QueryObserver` 通知组件 re-render
    query.addObserver(this)
  }
}
