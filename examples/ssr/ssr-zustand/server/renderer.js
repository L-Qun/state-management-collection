import { renderToString } from 'react-dom/server'

import App from '../client/App'
import { TodoStoreProvider } from '../client/store'

let count = 0
// 模拟请求延时
const wait = (time) => new Promise((r) => setTimeout(r, time))
const todos = ['吃饭', '睡觉', '打豆豆']
// 在不同的请求中延迟不同
const delayTime = [5000, 3000, 1000]

const renderer = async (ctx) => {
  // 请求数据
  const data = await wait(1000).then(() => todos[count])
  await wait(delayTime[count]) // 模拟其它请求

  // 渲染
  const htmlMarkup = renderToString(
    <TodoStoreProvider todo={data}>
      <App />
    </TodoStoreProvider>,
  )

  // 插入并返回 HTML
  ctx.body = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="root">${htmlMarkup}</div>
        <script>
          window.__STORE__ = ${JSON.stringify({ todo: data })} 
        </script>
        <script src="/main.js"></script>
      </body>
    </html>
  `
}

export default renderer
