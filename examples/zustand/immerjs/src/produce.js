const DRAFT_STATE = Symbol.for('DRAFT_STATE') // 定义了一个标识符，方便在代理对象中访问代理的内部状态

function latest(state) {
  return state.copy_ || state.base_ // 判断是否有缓存的状态
}

function markChanged(state) {
  // 标记已经修改了
  state.modified_ = true
  if (state.parent_) {
    // 递归给他的父级依次全部标记
    markChanged(state.parent_)
  }
}

const handler = {
  get(state, prop) {
    if (prop === DRAFT_STATE) return state
    const source = latest(state)
    const value = source[prop]
    // 如果属性值是对象，并且未被代理，则创建一个新的代理
    if (
      typeof value === 'object' &&
      value !== null &&
      value === state.base_[prop]
    ) {
      state.copy_ = { ...state.base_ }
      return (state.copy_[prop] = createProxy(value, state))
    }
    return value
  },
  set(state, prop, value) {
    if (!state.modified_) {
      state.copy_ = { ...state.base_ }
      markChanged(state) // 标记修改
    }
    state.copy_[prop] = value // 更新状态
    return true
  },
}

function createProxy(base, parent) {
  const state = {
    modified_: false, // 是否修改过
    parent_: parent, // 父proxy，方便在更新状态时找到父级对其标记modified_
    copy_: null, // 修改后的状态
    base_: base, // 原状态
  }
  const proxy = new Proxy(state, handler)
  return proxy
}

function processResult(proxy) {
  const state = proxy[DRAFT_STATE]
  if (!state.modified_) {
    // 判断是否修改过状态，如果没有则直接复用
    return state.base_
  }

  Object.entries(state.copy_).forEach(([key, childValue]) => {
    if (childValue[DRAFT_STATE]) {
      const res = processResult(childValue) // 递归
      state.copy_[key] = res
    }
  })

  return state.copy_
}

export function produce(base, recipe) {
  // 生成代理（Draft）
  const proxy = createProxy(base)
  // 修改代理（Draft）
  recipe(proxy)
  // 返回更新后的状态
  return processResult(proxy)
}
