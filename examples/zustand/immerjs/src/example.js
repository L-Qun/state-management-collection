const handler = {
  get(target, prop) {
    console.log('get', target, prop)
    const value = target[prop]
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value, handler)
    }
    return value
  },
  set(target, prop, value) {
    console.log('set', target, prop, value)
    return Reflect.set(target, prop, value)
  },
}

const state = {
  deep: {
    nested: {
      obj: {
        count: 1,
      },
    },
  },
}

const proxy = new Proxy(state, handler)
proxy.deep.nested.obj.count = 2

console.log(state.deep.nested.obj.count)
