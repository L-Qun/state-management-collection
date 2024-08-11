const { buildSchema } = require('graphql')
const express = require('express')
const { graphqlHTTP } = require('express-graphql')

// 使用 GraphQL schema language 构建一个 schema
const schema = buildSchema(`
  type Query {
    hello: String
  }
`)

// 根节点为每个 API 入口端点提供一个 resolver 函数
const resolver = {
  hello: () => {
    return 'Hello world!'
  },
}

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true,
  }),
)

app.listen(4000)

console.log('Running a GraphQL API server at http://localhost:4000/graphql')
