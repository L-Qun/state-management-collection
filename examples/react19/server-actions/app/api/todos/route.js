import { NextResponse } from 'next/server'

const TODOS = [
  { id: 0, text: '吃饭' },
  { id: 1, text: '睡觉' },
]

async function wait() {
  return new Promise((r) => {
    // 等待 1s 钟模拟请求时延
    setTimeout(r, 1000)
  })
}

export const GET = async () => {
  await wait()
  return NextResponse.json({ todos: TODOS })
}

export const POST = async (request) => {
  const formData = await request.formData()
  const todo = formData.get('todo')
  await wait()
  TODOS.push({
    id: TODOS.length,
    text: todo,
  })
  return NextResponse.json({ todos: TODOS })
}
