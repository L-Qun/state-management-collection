import { QueryClient, useQuery } from '../src'
import { renderWithClient } from './utils'

const queryClient = new QueryClient()

it('单元测试验证请求重试 (query retries) 能力', async () => {
  let count = 0
  function App() {
    const { data = 'default' } = useQuery({
      queryKey: ['key'],
      queryFn: async () => {
        count++
        if (count === 3) {
          return 'mu-mu'
        }
        throw new Error(`error${count}`)
      },
      retry: 3,
      retryDelay: 2,
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
  expect(count).toBe(3)
})
