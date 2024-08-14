'use client'

import { useAuthorsQuery, useBooksQuery } from '@/generated/graphql'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
} from '@apollo/client'

import GET_BOOKS from '../graphql/books/books.graphql'

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
})

const App = () => {
  // const { data } = useQuery<{ books: Array<{ title: string }> }>(GET_BOOKS)

  const { data: booksData } = useBooksQuery()

  const { data: authorsData } = useAuthorsQuery()

  return (
    <>
      {booksData?.books.map(({ title }) => <p>{title}</p>)}
      {authorsData?.authors.map(({ name }) => <p>{name}</p>)}
    </>
  )
}

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  )
}
