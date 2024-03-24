import { useDebugValue, useEffect, useState } from 'react'

import { ReadableAtom } from './atom'
import { Store, useStore } from './store'

const stateToPrintable = ([store, atoms]: [Store, ReadableAtom<unknown>[]]) =>
  atoms.reduce(
    (res, atom) => {
      const atomState = store.get(atom)
      res[atom.debugLabel] = { value: atomState }
      return res
    },
    {} as Record<string, unknown>,
  )

export function useAtomsDebugValue() {
  const store = useStore()

  const [atoms, setAtoms] = useState<ReadableAtom<unknown>[]>([])

  useEffect(() => {
    setAtoms(Array.from(store.get_mounted_atoms()))
  }, [store])

  useDebugValue([store, atoms], stateToPrintable)
}
