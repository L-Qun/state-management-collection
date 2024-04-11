const isObject = (x: unknown): x is object =>
  typeof x === 'object' && x !== null

type Listener = () => void
type RemoveListener = () => void
type AddListener = (listener: Listener) => RemoveListener

type CreateSnapshot = <T extends object>(target: T, version: number) => T

type ProxyState = readonly [
  target: object,
  ensureVersion: () => number,
  createSnapshot: CreateSnapshot,
  addListener: AddListener,
]

const proxyStateMap = new WeakMap<object, any>()

const buildProxyFunction = (
  // 快照缓存
  snapCache = new WeakMap<object, [version: number, snap: unknown]>(),

  // 获取最新状态
  createSnapshot = <T extends object>(target: T, version: number): T => {
    const cache = snapCache.get(target)
    // 判断当前状态版本是否在缓存中
    if (cache?.[0] === version) {
      return cache[1] as T
    }
    const snap: any = Array.isArray(target) ? [...target] : { ...target }
    // 缓存新快照
    snapCache.set(target, [version, snap])
    return snap
  },

  // 追踪状态更新、触发组件重新渲染
  proxyFunction = <T extends object>(baseObject: T): T => {
    // 需要传入一个对象
    if (!isObject(baseObject)) {
      throw new Error('object required')
    }
    const listeners = new Set<Listener>()
    let version: number = 1
    // 通知组件 re-render
    const notifyUpdate = () => {
      version++ // 抬升版本号
      listeners.forEach((listener) => listener())
    }
    const ensureVersion = () => {
      // 获取当前版本号
      return version
    }
    const addListener = (listener: Listener) => {
      listeners.add(listener)
      const removeListener = () => {
        listeners.delete(listener)
      }
      // 需要返回一个函数，组件卸载时调用，移除监听器
      return removeListener
    }
    const handler = {
      set(target: T, prop: string | symbol, value: any, receiver: object) {
        // 更新状态
        Reflect.set(target, prop, value, receiver)
        // 通知组件重新渲染
        notifyUpdate()
        return true
      },
    }
    const proxyObject = new Proxy(baseObject, handler)
    const proxyState: ProxyState = [
      baseObject,
      ensureVersion,
      createSnapshot,
      addListener,
    ]
    proxyStateMap.set(proxyObject, proxyState)
    return proxyObject
  },
) => [proxyFunction, snapCache, createSnapshot] as const

const [defaultProxyFunction] = buildProxyFunction()

export function proxy<T extends object>(initialObject: T): T {
  return defaultProxyFunction(initialObject)
}

export function subscribe<T extends object>(
  proxyObject: T,
  // `useSyncExternalStore` 传入的 `callback` 调用完成组件的重新渲染
  callback: Listener,
) {
  const proxyState = proxyStateMap.get(proxyObject)
  const addListener = proxyState[3]
  const removeListener = addListener(callback)
  return removeListener
}

export function snapshot<T extends object>(proxyObject: T): T {
  // 从缓存中获取代理对象对应的状态
  const proxyState = proxyStateMap.get(proxyObject)
  const [target, ensureVersion, createSnapshot] = proxyState
  // 获取最新状态
  return createSnapshot(target, ensureVersion())
}
