import { useQuery, gql } from '@apollo/client'

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

export default function App() {
  const { data, loading } = useQuery(GET_BOOKS)

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
    </>
  )
}
