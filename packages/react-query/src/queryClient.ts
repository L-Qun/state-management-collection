import { QueryCache } from './queryCache'
import {
  DefaultOptions,
  QueryClientConfig,
  QueryKey,
  QueryObserverOptions,
} from './types'
import { noop } from './utils'

export class QueryClient {
  #queryCache: QueryCache
  #defaultOptions: DefaultOptions

  constructor(config: QueryClientConfig = {}) {
    this.#queryCache = new QueryCache()
    this.#defaultOptions = config.defaultOptions || {}
  }

  defaultQueryOptions<TData = unknown, TQueryKey extends QueryKey = QueryKey>(
    options?: QueryObserverOptions<TData, TQueryKey>,
  ) {
    const defaultedOptions = {
      ...this.#defaultOptions,
      ...options,
    }
    return defaultedOptions
  }

  fetchQuery<TData = unknown, TQueryKey extends QueryKey = QueryKey>(
    options: QueryObserverOptions<TData, TQueryKey>,
  ) {
    const defaultedOptions = this.defaultQueryOptions(options)
    const query = this.#queryCache.build(defaultedOptions)
    return query.isStaleByTime(defaultedOptions.staleTime)
      ? query.fetch(options)
      : Promise.resolve(query.state.data)
  }

  // 预加载
  prefetchQuery<TData = unknown, TQueryKey extends QueryKey = QueryKey>(
    options: QueryObserverOptions<TData, TQueryKey>,
  ): Promise<void> {
    return this.fetchQuery(options).then(noop).catch(noop)
  }

  getQueryCache(): QueryCache {
    return this.#queryCache
  }

  clear(): void {
    this.#queryCache.clear()
  }
}
