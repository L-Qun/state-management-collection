'use server'

import { revalidatePath } from 'next/cache'

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

export const getTodos = async () => {
  await wait()
  return TODOS
}

export const formAction = async (formData) => {
  const todo = formData.get('todo')
  await wait()
  TODOS.push({
    id: TODOS.length,
    text: todo,
  })
  revalidatePath('/')
  return TODOS
}
