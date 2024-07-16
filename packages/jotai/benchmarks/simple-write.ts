import { add, complete, cycle, save, suite } from 'benny'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import { PrimitiveAtom, atom } from '../src/atom'
import { createStore } from '../src/store'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createStateWithAtoms = (n: number) => {
  let targetAtom: PrimitiveAtom<number> | undefined
  const store = createStore()
  for (let i = 0; i < n; ++i) {
    const a = atom(i)
    if (!targetAtom) {
      targetAtom = a
    }
    store.set(a, i)
  }
  if (!targetAtom) {
    throw new Error()
  }
  return [store, targetAtom] as const
}

const suiteCases = [2, 3, 4, 5, 6].map((n) =>
  add(`atoms=${10 ** n}`, () => {
    const [store, targetAtom] = createStateWithAtoms(10 ** n)
    return () => store.set(targetAtom, (c) => c + 1)
  }),
)

const main = async () => {
  await suite(
    'simple-write',
    ...suiteCases,
    cycle(),
    complete(),
    save({
      folder: __dirname,
      file: 'simple-write',
      format: 'json',
    }),
    save({
      folder: __dirname,
      file: 'simple-write',
      format: 'chart.html',
    }),
  )
}

main()
