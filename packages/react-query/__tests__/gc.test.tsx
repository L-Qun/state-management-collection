import { waitFor } from '@testing-library/react'

import { QueryClient } from '../src'
import { QueryCache } from '../src/queryCache'
import { QueryObserver } from '../src/queryObserver'

describe('测试垃圾回收', () => {
  let queryClient: QueryClient
  let queryCache: QueryCache

  beforeEach(() => {
    queryClient = new QueryClient()
    queryCache = queryClient.getQueryCache()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('正确从QueryCache中删除query', async () => {
    const key = ['todos']
    const observer = new QueryObserver(queryClient, {
      queryKey: key,
      queryFn: () => 'todos',
      gcTime: 0,
    })
    observer.setOptions()
    await waitFor(() => expect(queryCache.has(key)).toBe(false))
  })
})
