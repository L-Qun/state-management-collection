import { QueryCache } from './queryCache'

export class QueryClient {
  #queryCache: QueryCache

  constructor() {
    this.#queryCache = new QueryCache()
  }

  getQueryCache(): QueryCache {
    return this.#queryCache
  }
}
