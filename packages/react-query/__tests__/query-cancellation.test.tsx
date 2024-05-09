import { waitFor } from '@testing-library/react'
import { QueryClient, useQuery } from '../src'
import { QueryCache } from '../src/queryCache'
import { sleep } from '../src/utils'
import { Blink, renderWithClient } from './utils'

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

  it('单元测试验证查询取消 (query cancellation) 能力', async () => {
    const cancelFn = jest.fn()
    const queryFn = ({ signal }: { signal?: AbortSignal }) => {
      signal?.addEventListener('abort', cancelFn)
    }

    function Page() {
      const state = useQuery({ queryKey: ['todo'], queryFn })
      return (
        <div>
          <h1>Status: {state.status}</h1>
        </div>
      )
    }

    const rendered = renderWithClient(
      queryClient,
      <Blink duration={5}>
        <Page />
      </Blink>,
    )

    await waitFor(() => rendered.getByText('off'))

    expect(cancelFn).toHaveBeenCalled()
  })
})
