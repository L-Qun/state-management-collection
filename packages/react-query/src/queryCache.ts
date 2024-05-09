import { Query } from './query'
import type { QueryKey } from './types'

// 判断是否是对象且不为 `null`
function isObject(val: unknown): boolean {
  return typeof val === 'object' && val !== null
}

// 序列化 `queryKey`，这样方便根据相同的 `queryKey` 来映射 `query`
export function hashKey(queryKey: QueryKey): string {
  return JSON.stringify(queryKey, (_, val) =>
    isObject(val)
      ? Object.keys(val) // 如果是对象的话就进行排序，得到稳定的一致的字符串结果
          .sort()
          .reduce((result, key) => {
            result[key] = val[key]
            return result
          }, {} as any)
      : val,
  )
}

export class QueryCache {
  #queries: Map<string, Query>

  constructor() {
    // 缓存，`queryKey` -> `query` 的映射
    this.#queries = new Map<string, Query>()
  }

  // 给定 `queryKey` 判断缓存中是否包含对应 `query`
  has(queryKey: Array<unknown>): boolean {
    return Array.from(this.#queries.keys()).some(
      (queryHash) => queryHash === hashKey(queryKey),
    )
  }

  // `queryHash` —> `query`
  get(queryHash: string) {
    return this.#queries.get(queryHash)
  }

  // 如果当前没有缓存就将该 `query` 加入到缓存中
  add(query: Query): void {
    if (!this.#queries.has(query.queryHash)) {
      this.#queries.set(query.queryHash, query)
    }
  }

  // 移除缓存
  remove(query: Query<any, any, any>): void {
    const queryInMap = this.#queries.get(query.queryHash)

    if (queryInMap) {
      // 防御性编程，理论上相同的 `queryHash` 应该对应同一个 `query`
      if (queryInMap === query) {
        this.#queries.delete(query.queryHash)
      }
    }
  }

  // 构建 `Query` 实例
  build(options: any) {
    const queryKey = options.queryKey
    const queryHash = hashKey(queryKey)
    let query = this.get(queryHash)
    // 保障了在相同 `queryKey` 下对应同一个 `query`
    if (!query) {
      query = new Query({
        queryKey,
        queryHash,
        options,
        cache: this,
      })
      this.add(query)
    }
    return query
  }

  // 获取全部 `Query` 实例
  getAll(): Array<Query> {
    return [...this.#queries.values()]
  }

  clear() {
    this.getAll().forEach((query) => {
      this.remove(query)
    })
  }
}
