// 单元测试验证基本功能
import { QueryClient, useQuery } from '../src'
import { renderWithClient } from './utils'

function sleep(timeout: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, timeout)
  })
}

describe('useQuery', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('basic', async () => {
    function App() {
      const { data = 'default' } = useQuery({
        queryKey: ['key'],
        queryFn: async () => {
          await sleep(10)
          return 'mu-mu'
        },
      })

      return (
        <div>
          <h1>{data}</h1>
        </div>
      )
    }
    const { findByText } = renderWithClient(queryClient, <App />)
    await findByText('default')
    await findByText('mu-mu')
  })
})
