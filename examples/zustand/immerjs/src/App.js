import { create } from 'zustand'
// import { produce } from 'immer'
import { produce } from './produce'

const useStore = create((set) => ({
  deep: {
    nested: {
      obj: {
        count: 1,
      },
    },
  },
  increment: () =>
    set((state) =>
      produce(state, (draft) => {
        draft.deep.nested.obj.count++
      }),
    ),
}))

export default function App() {
  const {
    deep: {
      nested: {
        obj: { count },
      },
    },
    increment,
  } = useStore()

  return (
    <div>
      <div>{count}</div>
      <button onClick={increment}>+1</button>
    </div>
  )
}
