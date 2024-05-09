import { QueryClient } from '../src'
import { sleep } from '../src/utils'

describe('测试 `staleTime` 功能', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('只有当超出 `staleTime` 时间才发起额外的请求', async () => {
    const key = ['todos']
    let count = 0
    const fetchFn = () => ++count

    const first = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 100,
    })
    const second = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 100,
    })
    const third = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 100,
    })
    await sleep(101)
    const fourth = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 100,
    })

    expect(first).toBe(1)
    expect(second).toBe(1)
    expect(third).toBe(1)
    expect(fourth).toBe(2)
  })
})
