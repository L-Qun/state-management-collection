import type { ReadableAtom, WritableAtom, Getter, Setter } from './atom'

type AnyReadableAtom = ReadableAtom<unknown>
type AnyWritableAtom = WritableAtom<unknown, unknown[], unknown>

type Dependencies = Map<AnyReadableAtom, AtomState>
type NextDependencies = Map<AnyReadableAtom, AtomState | undefined>

type AtomState<Value = unknown> = {
  // 这里的d是代表这个atom依赖了哪些其他atom，也就是需要get哪些atom来完成状态的计算
  d: Dependencies
  v: Value
}

type Dependents = Set<AnyReadableAtom>
type Mounted = {
  // 这里的l代表哪些其他atom依赖了这个atom，当这里的atom状态发生变化时需要根据l参数找到所有依赖完成状态的重新计算和组件的重新渲染
  l: Set<() => void>
  t: Dependents
}

type MountedAtoms = Set<AnyReadableAtom>

const hasInitialValue = <T extends ReadableAtom<unknown>>(
  atom: T,
): atom is T &
  (T extends ReadableAtom<infer Value> ? { init: Value } : never) =>
  'init' in atom

// 判断两个atom状态是否一致
const isEqualAtomValue = <Value>(a: AtomState<Value>, b: AtomState<Value>) =>
  'v' in a && 'v' in b && Object.is(a.v, b.v)

// 返回 atom 对应的状态
const returnAtomValue = <Value>(atomState: AtomState<Value>): Value => {
  return atomState.v
}

export const createStore = () => {
  // 维护atom和状态的映射
  const atomStateMap = new WeakMap<AnyReadableAtom, AtomState>()
  // 维护订阅atom，当sub atom时会将atom加入到mountedMap中
  const mountedMap = new WeakMap<AnyReadableAtom, Mounted>()
  // 维护需要更新状态的atom的集合
  const pendingMap = new Map<AnyReadableAtom, AtomState | undefined>()

  let mountedAtoms: MountedAtoms = new Set() // 用于给 Jotai DevTools 使用

  const getAtomState = <Value>(atom: ReadableAtom<Value>) =>
    atomStateMap.get(atom) as AtomState<Value> | undefined // 从atomStateMap上获取状态

  const setAtomState = <Value>(
    atom: ReadableAtom<Value>,
    atomState: AtomState<Value>,
  ): void => {
    // 更新atom对应的状态，并将该atom和先前的状态加入到pendingMap中
    const prevAtomState = atomStateMap.get(atom)
    atomStateMap.set(atom, atomState)
    if (!pendingMap.has(atom)) {
      pendingMap.set(atom, prevAtomState)
    }
  }

  const setAtomValue = <Value>(
    atom: ReadableAtom<Value>,
    value: Value,
    nextDependencies?: NextDependencies,
  ): AtomState<Value> => {
    const prevAtomState = getAtomState(atom)
    const nextAtomState: AtomState<Value> = {
      d: nextDependencies || new Map(),
      v: value,
    }
    if (prevAtomState && isEqualAtomValue(prevAtomState, nextAtomState)) {
      // 这里会判断最新的状态和先前的状态是否一致，也就是判断v是否一致，不一致才需要更新状态
      return prevAtomState
    }
    setAtomState(atom, nextAtomState)
    return nextAtomState
  }

  const readAtomState = <Value>(
    atom: ReadableAtom<Value>,
    force?: boolean,
  ): AtomState<Value> => {
    const atomState = getAtomState(atom)
    // 这里会判断缓存，如果不是强制重新读状态(force = true)，否则直接从Map中取回缓存的状态
    if (!force && atomState) {
      return atomState
    }
    const nextDependencies: NextDependencies = new Map()
    const getter: Getter = <V>(a: ReadableAtom<V>) => {
      // 这里需要判断是读当前的atom还是读的其他atom
      if ((a as AnyReadableAtom) === atom) {
        const aState = getAtomState(a)
        if (aState) {
          // 记录atom依赖了哪些其他atom，也就是说get了哪个就将哪个atom加入到nextDependencies
          nextDependencies.set(a, aState)
          return returnAtomValue(aState)
        }
        if (hasInitialValue(a)) {
          nextDependencies.set(a, undefined)
          return a.init
        }
        throw new Error('no atom init')
      }
      // 如果不是读的自己，则递归调用readAtomState去读，并加入到依赖项nextDependencies中
      const aState = readAtomState(a)
      nextDependencies.set(a, aState)
      return returnAtomValue(aState)
    }
    // 这里其实就是构造了一个getter函数，并传入到read函数中来得到value
    const value = atom.read(getter)
    // 然后将最新的值更新到atomStateMap中
    return setAtomValue(atom, value, nextDependencies)
  }

  const readAtom = <Value>(atom: ReadableAtom<Value>): Value =>
    returnAtomValue(readAtomState(atom))

  const recomputeDependents = (atom: AnyReadableAtom): void => {
    // t上记录了哪些其他atom依赖了这个atom
    const dependents = new Set(mountedMap.get(atom)?.t)
    dependents.forEach((dependent) => {
      if (dependent !== atom) {
        // 因为要重新计算状态，所以这里第二个参数force = true，并且这个过程会将变化的atom加入到pendingMap中
        readAtomState(dependent, true)
      }
      recomputeDependents(dependent)
    })
  }

  const writeAtomState = <Value, Args extends unknown[], Result>(
    atom: WritableAtom<Value, Args, Result>,
    ...args: Args
  ): Result => {
    const getter: Getter = <V>(a: ReadableAtom<V>) =>
      returnAtomValue(readAtomState(a))
    const setter: Setter = <V, As extends unknown[], R>(
      a: WritableAtom<V, As, R>,
      ...args: As
    ) => {
      let r: R | undefined
      if ((a as AnyWritableAtom) === atom) {
        const prevAtomState = getAtomState(a)
        const nextAtomState = setAtomValue(a, args[0] as V)
        if (!prevAtomState || !isEqualAtomValue(prevAtomState, nextAtomState)) {
          // 这里判断状态是否真的发生了变化，如果改变则需要重新去计算依赖的atom的状态
          recomputeDependents(a)
        }
      } else {
        // 如果不是set当前的atom，则需要递归来完成状态更新
        r = writeAtomState(a as AnyWritableAtom, ...args) as R
      }
      return r as R
    }
    // 这里其实就是创建了getter和setter函数，并传入到atom.write而已
    const result = atom.write(getter, setter, ...args)
    return result
  }

  const flushPending = (): void | Set<AnyReadableAtom> => {
    while (pendingMap.size) {
      const pending = Array.from(pendingMap)
      pendingMap.clear()
      pending.forEach(([atom, prevAtomState]) => {
        const atomState = getAtomState(atom)
        const mounted = mountedMap.get(atom)
        if (
          mounted &&
          atomState &&
          !(prevAtomState && isEqualAtomValue(prevAtomState, atomState))
        ) {
          mounted.l.forEach((listener) => listener())
        }
      })
    }
  }

  const writeAtom = <Value, Args extends unknown[], Result>(
    atom: WritableAtom<Value, Args, Result>,
    ...args: Args
  ): Result => {
    // 更新atom状态
    const result = writeAtomState(atom, ...args)
    // 触发重新渲染
    flushPending()
    return result
  }

  const mountAtom = <Value>(
    atom: ReadableAtom<Value>,
    initialDependent?: AnyReadableAtom,
  ): Mounted => {
    // 分析atom依赖了哪些其他atom，然后逐个加入到mountedMap中
    getAtomState(atom)?.d.forEach((_, a) => {
      // 寻找依赖的方式是通过getAtomState(atom)，上面的d参数就是atom依赖的其他atom。这个过程是记录atom的依赖项，这样当状态变化时就知道要去重新计算哪些atom的状态。
      const aMounted = mountedMap.get(a)
      if (aMounted) {
        aMounted.t.add(atom)
      } else {
        if (a !== atom) {
          // 递归，确保直接或间接依赖都加入到mountedMap中
          mountAtom(a, atom)
        }
      }
    })
    const mounted: Mounted = {
      t: new Set(initialDependent && [initialDependent]),
      l: new Set(),
    }
    mountedMap.set(atom, mounted)
    // 将atom加入到mountedMap中
    mountedAtoms.add(atom)
    return mounted
  }

  const addAtom = (atom: AnyReadableAtom): Mounted => {
    let mounted = mountedMap.get(atom)
    if (!mounted) {
      mounted = mountAtom(atom)
    }
    return mounted
  }

  const unmountAtom = <Value>(atom: ReadableAtom<Value>): void => {
    // 卸载atom
    mountedMap.delete(atom)
    // 将atom从mountedMap中剔除
    const atomState = getAtomState(atom)
    if (atomState) {
      // 这里的作用是分析mountedMap中的所有atom中有哪些依赖了atom，也就是说把atom从t上删除
      atomState.d.forEach((_, a) => {
        if (a !== atom) {
          const mounted = mountedMap.get(a)
          if (mounted?.t.has(atom)) {
            mounted.t.delete(atom)
          }
        }
      })
    }
  }

  // 完成对atom的订阅，listener的作用是当atom状态发生变化时调用listener来完成组件的重新渲染
  const subscribeAtom = (atom: AnyReadableAtom, listener: () => void) => {
    // 将当前atom加入到mountedMap中
    const mounted = addAtom(atom)
    const listeners = mounted.l
    // 这里的listener就是useReducer返回的rerender函数，调用可以触发对应组件重新渲染
    listeners.add(listener)
    // 返回unsub函数，当组件卸载时调用
    return () => {
      unmountAtom(atom)
    }
  }

  return {
    get: readAtom,
    set: writeAtom,
    sub: subscribeAtom,
    get_mounted_atoms: () => mountedAtoms.values(), // 用于给 Jotai DevTools 使用
  }
}

export type Store = ReturnType<typeof createStore>

let defaultStore: Store | null = null
export const useStore = () => {
  if (!defaultStore) {
    defaultStore = createStore()
  }
  return defaultStore
}
