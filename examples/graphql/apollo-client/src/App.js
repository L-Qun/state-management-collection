import { useQuery, gql, useMutation } from '@apollo/client'

const GET_BOOKS = gql`
  query Books {
    books {
      title
      year
      authors {
        name
      }
    }
  }
`

const ADD_BOOK_MUTATION = gql`
  mutation AddBook($title: String!, $year: Int!, $authorNames: [String]!) {
    addBook(title: $title, year: $year, authorNames: $authorNames) {
      title
    }
  }
`

export default function App() {
  const { data, loading } = useQuery(GET_BOOKS)

  const [mutateFunction, { loading: mutationLoading }] = useMutation(
    ADD_BOOK_MUTATION,
    {
      refetchQueries: [GET_BOOKS],
    },
  )

  if (loading) return <div>loading...</div>

  return (
    <>
      {data.books.map(({ title, year, authors }) => (
        <>
          <p>
            {title}-{year}
          </p>
          <ul>
            {authors.map((author) => (
              <li>{author.name}</li>
            ))}
          </ul>
        </>
      ))}
      <button
        disabled={mutationLoading}
        onClick={() => {
          mutateFunction({
            variables: {
              title: 'book4',
              year: 2024,
              authorNames: ['author1', 'author2', 'author3'],
            },
          })
        }}
      >
        add a book
      </button>
    </>
  )
}
