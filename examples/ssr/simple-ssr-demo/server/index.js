import Koa from 'koa'
import serve from 'koa-static'
import path from 'path'

import renderer from './renderer'

const app = new Koa()

// 提供静态文件服务
app.use(serve(path.resolve(__dirname, '../client')))

// 处理 SSR 渲染
app.use(renderer)

app.listen(3000, () => {
  console.log('服务监听在3000端口')
})
