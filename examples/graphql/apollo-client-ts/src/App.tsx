import { useQuery } from '@apollo/client'

import GET_BOOKS from './graphql/books.gql'

export default function App() {
  const { data, loading } = useQuery<{ books: Array<{ title: string }> }>(
    GET_BOOKS,
  )

  if (loading) return <div>loading...</div>

  return (
    <>
      {data?.books.map(({ title }) => (
        <>
          <p>{title}</p>
        </>
      ))}
    </>
  )
}
