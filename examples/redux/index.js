const { createStore } = require('redux')

const initialState = {
  count: 0,
}

const INCREMENT = 'INCREMENT'
const DECREMENT = 'DECREMENT'

function increment() {
  return { type: INCREMENT }
}

function decrement() {
  return { type: DECREMENT }
}

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 }
    case DECREMENT:
      return { count: state.count - 1 }
    default:
      return state
  }
}

// 创建 store
const store = createStore(counterReducer)

// 订阅 store，当状态发生变化时执行回调函数
store.subscribe(() => {
  console.log('当前状态：', store.getState())
})

store.dispatch(increment()) // 当前状态： { count: 1 }
store.dispatch(increment()) // 当前状态： { count: 2 }
store.dispatch(decrement()) // 当前状态： { count: 1 }
