const AFFECTED_PROPERTY = 'a'
const PROXY_PROPERTY = 'p'
const KEYS_PROPERTY = 'k'
const HAS_KEY_PROPERTY = 'h'
const ALL_OWN_KEYS_PROPERTY = 'w'

type Used = {
  [HAS_KEY_PROPERTY]?: Set<string | symbol>
  [ALL_OWN_KEYS_PROPERTY]?: true
  [KEYS_PROPERTY]?: Set<string | symbol>
}
type Affected = WeakMap<object, Used>
type ProxyHandlerState<T extends object> = {
  [PROXY_PROPERTY]?: T
  [AFFECTED_PROPERTY]?: Affected
}

const isObject = (x: unknown): x is object =>
  typeof x === 'object' && x !== null

const createProxyHandler = <T extends object>(origObj: T) => {
  const state: ProxyHandlerState<T> = {}

  // 记录属性访问情况
  const recordUsage = (
    type:
      | typeof HAS_KEY_PROPERTY
      | typeof ALL_OWN_KEYS_PROPERTY
      | typeof KEYS_PROPERTY,
    key?: string | symbol,
  ) => {
    let used = (state[AFFECTED_PROPERTY] as Affected).get(origObj)
    if (!used) {
      used = {}
      ;(state[AFFECTED_PROPERTY] as Affected).set(origObj, used)
      // 当 `type` 为 `ALL_OWN_KEYS_PROPERTY` 时，代表后面在对比变化时需要对比全部属性
      if (type === ALL_OWN_KEYS_PROPERTY) {
        used[ALL_OWN_KEYS_PROPERTY] = true
      } else {
        let set = used[type]
        if (!set) {
          set = new Set()
          used[type] = set
        }
        set.add(key as string | symbol) // 记录访问了哪些属性
      }
    }
  }

  const handler: ProxyHandler<T> = {
    // 拦截读取对象属性的操作
    get(target, key) {
      recordUsage(KEYS_PROPERTY, key)
      // 需要对返回的对象继续代理
      return createProxy(
        Reflect.get(target, key),
        state[AFFECTED_PROPERTY] as Affected,
      )
    },
    // 拦截 `in` 操作
    has(target, key) {
      recordUsage(HAS_KEY_PROPERTY, key)
      return Reflect.has(target, key)
    },
    // 拦截获取对象全部属性操作，如：`Object.keys(target)`、`Reflect.ownKeys(target)`、`Object.getOwnPropertyNames(target)`、`Object.getOwnPropertySymbols(target)`
    ownKeys(target) {
      recordUsage(ALL_OWN_KEYS_PROPERTY)
      return Reflect.ownKeys(target)
    },
  }

  return [handler, state] as const
}

// 创建一个 Proxy 对象，用来追踪哪些属性被访问了，这些属性才是组件真正关心的内容，在触发组件重新渲染时只需要对比这些属性即可
export const createProxy = <T>(
  obj: T,
  affected: WeakMap<object, unknown>,
): T => {
  if (typeof obj === 'object' && obj !== null) {
    const handlerAndState = createProxyHandler(obj)
    handlerAndState[1][PROXY_PROPERTY] = new Proxy(obj, handlerAndState[0])
    handlerAndState[1][AFFECTED_PROPERTY] = affected as Affected
    return handlerAndState[1][PROXY_PROPERTY]
  }
  return obj
}

// 用来根据 `affected` 的使用记录来对比传入的两个对象中用到的属性上是否发生变化
export const isChanged = (
  prevObj: unknown,
  nextObj: unknown,
  affected: WeakMap<object, unknown>,
): boolean => {
  // 判断对比双方是否完全相同
  if (Object.is(prevObj, nextObj)) return false
  // 判断是否不是对象
  if (!isObject(prevObj) || !isObject(nextObj)) return true
  const used = (affected as Affected).get(prevObj)
  if (!used) return true
  let changed: boolean = false
  // 这里依次对比 `KEYS_PROPERTY`、`HAS_KEY_PROPERTY`、`ALL_OWN_KEYS_PROPERTY`
  for (const key of used[HAS_KEY_PROPERTY] || []) {
    changed = Reflect.has(prevObj, key) !== Reflect.has(nextObj, key) // 这里因为拦截的是 `has` 操作，所以判断的是前后有没有这个属性
    if (changed) return changed
  }
  if (used[ALL_OWN_KEYS_PROPERTY] === true) {
    // 对比全部属性
    const prevKeys = Reflect.ownKeys(prevObj)
    const nextKeys = Reflect.ownKeys(nextObj)
    return (
      prevKeys.length !== nextKeys.length ||
      prevKeys.some((k, i) => k !== nextKeys[i]) // 这里对比的是key
    )
  }
  for (const key of used[KEYS_PROPERTY] || []) {
    // 递归对比状态是否改变
    changed = isChanged((prevObj as any)[key], (nextObj as any)[key], affected)
    // 如果发现改变了就直接返回true
    if (changed) return changed
  }
  return changed
}
