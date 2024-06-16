import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'

import renderer from './renderer'

const app = new Koa()

app.use(serve(path.resolve(__dirname, '../client')))

app.use(renderer)

app.listen(3000, () => {
  console.log('服务监听在3000端口')
})
