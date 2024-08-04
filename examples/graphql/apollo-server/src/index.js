import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { books, authors } from './mock.js'

const typeDefs = `
  type Book {
    title: String
    authors: [Author]
    year: Int
  }

  type Author {
    name: String
    books: [Book]
    nationality: String
  }

  type Query {
    books: [Book]
    authors: [Author]
  }
`

const resolvers = {
  Query: {
    books: () => books,
    authors: () => authors,
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

console.log(`🚀  Server ready at: ${url}`)
