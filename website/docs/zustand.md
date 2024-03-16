---
sidebar_position: 2
slug: /zustand
---

# Zustand

什么是一个好的库呢？在我看来，就是它使用起来一定要符合直觉，没有那么多的概念。

Zustand 就是一个非常符合这个原则的库，如果你亲身体验过 Zustand，相信你一定会爱上它，因为它用起来实在是太简单了！当然，社区对它的赞美也不绝于耳，比如 [Issue](https://github.com/pmndrs/zustand/issues/100) 。

![image-20240316134523182](/img/1.png)

在本章节中，我们会介绍 Zustand 的基本用法与思想，更细节部分参考[官网](https://docs.pmnd.rs/zustand/guides/updating-state)。

## 从一个案例开始

本章中通过完成一个 todos 需求带领大家快速入门 Zustand，代码参见项目中路径：`/examples/zustand/todos`，最终效果如下：

![image-20240316134523182](/img/2.gif)

这是一个初始版本，在后续 React Devtools 章节会带领大家结合这个案例进一步进行性能优化。

### 安装 Zustand

```js
// npm
npm install zustand
// yarn
yarn add zustand
// pnpm
pnpm add zustand
```

为了让页面更好看一些，我们同时也安装一下 `antd` 和 `@react-spring/web`。

### 创建 store

然后通过 Zustand 的 `create` 可以创建一个 store：

```js
import { create } from 'zustand'

const useStore = create((set) => ({
  filter: 'all',
  todos: [],
  setFilter(filter) {
    set({ filter })
  },
  setTodos(fn) {
    set((prev) => ({ todos: fn(prev.todos) }))
  },
}))
```

可以看到，我们通过 `create` 创建了一个 store，包含了：

- `filter` 代表选择项，可以选择 `all` 代表全部工作，`completed` 代表已完成项，`incompleted` 代表待完成项。
- `todos` 代表代办事项，其中每个 todo item 中包含了 `title` 代表 和 `completed` 代表是否完成。
- `setFilter` 用来修改 `filter` 数据。
- `setTodos` 用来修改 `todos` 数据。

如下，可以看到整个页面大致分为三块，下面我们分别来对每一部分进行实现。

![image-20240316135344464](/img/3.png)

### App 组件

```js
const App = () => {
  const { setTodos } = useStore()
  const add = (e) => {
    e.preventDefault()
    const title = e.currentTarget.inputTitle.value
    e.currentTarget.inputTitle.value = ''
    setTodos((prevTodos) => [
      ...prevTodos,
      { title, completed: false, id: keyCount++ },
    ])
  }

  return (
    <form onSubmit={add}>
      <Filter />
      <input name="inputTitle" placeholder="Type ..." />
      <Filtered />
    </form>
  )
}
```

在 `<App />` 组件中返回内容被 `<form></form>` 包裹，并提供一个 `add` 函数，当用户在表单内的一个 `input` 字段中按下回车键（Enter）时会执行 `onSubmit` 回调函数。

当执行 `add` 时，将 `<input />` 内容插入到 Zustand store 里，并清空内容。

### Filter 组件

```js
import { Radio } from 'antd'

const Filter = () => {
  const { filter, setFilter } = useStore()
  return (
    <Radio.Group onChange={(e) => setFilter(e.target.value)} value={filter}>
      <Radio value="all">All</Radio>
      <Radio value="completed">Completed</Radio>
      <Radio value="incompleted">Incompleted</Radio>
    </Radio.Group>
  )
}
```

这里提供了三个 `radio`，点击每个按钮时更新 `filter` 字段。

### Filtered 组件

```js
const Filtered = () => {
  const { todos, filter } = useStore()
  const filterTodo = todos.filter((todo) => {
    if (filter === 'all') return true
    if (filter === 'completed') return todo.completed
    return !todo.completed
  })
  const transitions = useTransition(filterTodo, {
    keys: (todo) => todo.id,
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: 40 },
    leave: { opacity: 0, height: 0 },
  })
  return transitions((style, item) => (
    <a.div className="item" style={style}>
      <TodoItem item={item} />
    </a.div>
  ))
}
```

`<Filtered />` 组件包含了全部的 Todo 列表，我们可以把每个 Todo 项单独拆成一个组件 `<TodoItem />`，让代码更干净一些。

在 `<Filtered />` 组件里读取 store 的 `todos` 和 `filter` 字段，并根据 `filter` 字段筛选 `todos` 。

### TodoItem 组件

```js
import { CloseOutlined } from "@ant-design/icons";

const TodoItem = ({ item }: { item: Todo }) => {
  const { setTodos } = useStore();
  const { title, completed, id } = item;

  const toggleCompleted = () =>
    setTodos((prevTodos) =>
      prevTodos.map((prevItem) =>
        prevItem.id === id ? { ...prevItem, completed: !completed } : prevItem,
      ),
    );

  const remove = () => {
    setTodos((prevTodos) => prevTodos.filter((prevItem) => prevItem.id !== id));
  };

  return (
    <>
      <input type="checkbox" checked={completed} onChange={toggleCompleted} />
      <span style={{ textDecoration: completed ? "line-through" : "" }}>
        {title}
      </span>
      <CloseOutlined onClick={remove} />
    </>
  );
};

```

对于每个 Todo 项，我们可以决定是否完成，以及是否取消，分别对应 `toggleCompleted` 函数以及 `remove` 函数。

## 和 Immer 一起工作

假如现在有一个复杂的状态，这个状态对象嵌套了多层级，我们称之为`nestedObject`。如下：

```js
const nestedObject = {
  deep: {
    nested: {
      obj: {
        count: 0,
      },
    },
  },
}
```

如果我们想要更新这个状态，应该怎么做？

```js
const useStore = create((set) => ({
  nestedObject,
  updateState() {
    set((prevState) => ({
      nestedObject: {
        ...prevState.nestedObject,
        deep: {
          ...prevState.nestedObject.deep,
          nested: {
            ...prevState.nestedObject.deep.nested,
            obj: {
              ...prevState.nestedObject.deep.nested.obj,
              count: ++prevState.nestedObject.deep.nested.obj.count,
            },
          },
        },
      },
    }))
  },
}))
```

好吧，实在是太复杂了，而且稍有不慎就会出问题。其实，我们可以借助 [Immer](https://github.com/immerjs/immer) 来优化这个问题，最终上面的代码将被优化为：

```js
import { produce } from 'immer'

const useStore = create((set) => ({
  nestedObject,
  updateState() {
    set(produce(state => {
      ++state.nestedObject.deep.nested.obj.count;
    });
  },
}));
```

这样就清爽多了！但是如果你的业务涉及到服务端渲染，则不建议使用 Immer，因为相比于传统的对象解构这会带来更多的 CPU 消耗，这部分我们在[深入 Immer 原理](https://juejin.cn/book/7311970169411567626/section/7331920132526047259)一节中会进一步探讨。

## 状态选取

前文提到，我们可以基于 `create` 创建的 hooks 来读取 store 的状态，但是这有一个缺点，就是当状态发生变化时，即使在该组件中没有使用到，也会发生 re-render。

我们创建一个场景来模拟这个行为，代码见`/packages/zustand/__tests__/re-render.test.tsx`。

还是借上面 Todo 的例子：

```js
let renderCount = 0

const Display = () => {
  renderCount++ // 每次re-render就会增加1
  const { todos } = useStore()
  return (
    <div>
      {todos.map((todo) => (
        <div>title: {todo.title}</div>
      ))}
    </div>
  )
}

const Control = () => {
  const { setFilter } = useStore()
  return <button onClick={() => setFilter('completed')}>dispatch</button>
}

const App = () => (
  <>
    <Display />
    <Control />
  </>
)
```

创建了一个 `<Control />` 组件用来更新 `filter` 字段，借助 `@testing-library/react` 来模拟点击情况，借助 Jest 的断言来观察 `<Display />` 的 re-render 情况：

```js
expect(renderCount).toBe(2)
```

我们发现 `<Display />` re-render 了两次，即按钮的点击带来了额外的重新渲染，很显然这会导致性能上的问题。`<Display />` 组件只用到了 `todos` 字段，对于其他字段的变更不应该导致 `<Display />` 发生 re-render。

我们将原先的：

```js
const { todos } = useStore()
```

改为：

```js
const todos = useStore((state) => state.todos)
```

重新运行测试：

```js
expect(renderCount).toBe(1)
```

![image-20240316135507143](/img/4.png)

但我们会发现有些开发者经常会忘记向 `useStore` 中传入 selector，从而带来性能问题。Zustand 官方提供了一种方式，即使用 `crateSelectors` 来自动生成 selector：

```js
import { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  let store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (let k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}
```

这样上面 Todos 代码会变为：

```js
const useStoreBase = create((set) => ({
  filter: 'all',
  todos: [],
  setFilter(filter) {
    set({ filter })
  },
  setTodos(fn) {
    set((prev) => ({ todos: fn(prev.todos) }))
  },
}))

const useStore = createSelectors(useStoreBase)

// 获取属性
const bears = useBearStore.use.todos()

// 获取方法
const increment = useBearStore.use.increment()
```

可以看到这样就不容易产生漏传 selector 的问题了，因为 `crateSelectors` 内部已经包了一层传好的。

## 浅层比较 `shallow`

默认情况下，当状态变化时，会先根据传入的 selector 函数计算最新的状态，之后会以 [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) 的形式来对比与上一次计算的状态是否一致来决定是否触发 re-render。

举个例子：

```js
const { todos, setFilter } = useStore((state) => ({
  todos: state.todos,
  setFilter: state.setFilter,
}))
```

当第一次渲染时会调用这里的 `useStore` 计算一次状态，这时候计算好的状态是一个包含了 `todos` 和 `setFilter` 的对象。接下来我们更新 store 里的 `filter` 字段，这时候 Zustand 会再次调用回调函数，计算一遍状态，生成一个新的对象。然后以 `Object.is` 的形式来对比前后两次对象是否发生变化，很显然虽然 `todos` 和 `setFilter` 都没有变，但是对象的引用改变了，`Object.is` 仍然会返回 `false`。

这种问题通常的解决方案是**浅层比较**，即对比对象里层的`todos` 和 `setFilter` 是否改变了，Zustand 提供了一个浅层比较的实现 `shallow`，我们基于此来改写上述代码：

```js
import { shallow } from 'zustand/shallow'

const { todos, setFilter } = useStore(
  (state) => ({
    todos: state.todos,
    setFilter: state.setFilter,
  }),
  shallow,
)
```

这样就不会带来额外的 re-render 了～

另外，Zustand 也提供了一个 hook `useShallow` 来解决上面的问题：

```js
const { todos, setFilter } = useStore(
  useShallow((state) => ({
    todos: state.todos,
    setFilter: state.setFilter,
  })),
)
```

也就是说，`useShallow` 是另一种解决 re-render 的方案，也是目前 Zustand 的推荐用法。

## 处理异步操作

Zustand 是一个非常灵活的状态管理库，可以轻松地与异步代码结合使用。
让我们直接来看一个[例子](https://codesandbox.io/p/sandbox/async-hj8ss3)：

```js
import { useEffect } from 'react'
import { create } from 'zustand'

const useStore = create((set) => ({
  todos: null,
  error: null,
  fetchData: async () => {
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/todos`)
      const todos = await res.json()
      set({ todos })
    } catch (error) {
      set({ error })
    }
  },
}))

export default function App() {
  const { todos, fetchData, error } = useStore()

  useEffect(() => {
    fetchData()
  }, [])

  if (!todos) return <div>Loading...</div>

  if (error) return <div>{error.message}</div>

  return (
    <div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

![image-20240316135507143](/img/5.gif)

在这个例子中，`fetchData` 是一个异步函数，用来拉取 todos 数据并填充到 Zustand Store 中， `App` 组件中则根据不同的状态来判断是渲染 loading、error、还是 todos。

## Zustand 推荐的使用姿势

在“[前置知识](https://juejin.cn/book/7311970169411567626/section/7319835446161178636)”这一章节中我们介绍了 Flux 的基本概念，Zustand 推荐了一种最佳实践，灵感就来自于 Flux。

1. 单一 Store：对于一个应用的全局数据应该放到一个单一的 Zustand Store 中。

2. 使用`set/setState`来更新状态：Zustand 提供了`create` API 接收一个回调函数，这个回调函数会接收 set 用来更新状态，我们在更新 store 数据的时候需要用这个 set，这样在更新状态时才能够正确地通知 View 完成更新。
3. 对于 Zustand 可以不需要像其他利用 Flux 理念的库一样通过派发 action 来完成状态的更新，而是在`create`回调函数中集成各种 dispatchers 即可，因此 Zustand 的理念和传统的 Flux 有一些区别。

但 Zustand 也提供了一种方案来支持 Flux：

```js
const types = { increase: 'INCREASE', decrease: 'DECREASE' }

const reducer = (state, { type, by = 1 }) => {
  switch (type) {
    case types.increase:
      return { grumpiness: state.grumpiness + by }
    case types.decrease:
      return { grumpiness: state.grumpiness - by }
  }
}

const useGrumpyStore = create((set) => ({
  grumpiness: 0,
  dispatch: (args) => set((state) => reducer(state, args)),
}))

const dispatch = useGrumpyStore((state) => state.dispatch)
dispatch({ type: types.increase, by: 2 })
```

在上面中我们通过类似于 react-redux 一样定义了一个`reducer`，然后在 create 回调函数中定义了一个`dispatch`函数，并将先前的状态与参数传入到`reducer`中来计算最新的状态。

不过说实话这样真是有一种脱裤子放屁的感觉。。明明可以直接更新的，非要绕一圈。当然按照我们在 [“React 状态管理库的现状与未来”](https://juejin.cn/book/7311970169411567626/section/7313461629802184714)一章中的结论来看，其实 Flux 非常不符合未来趋势。

## 总结

通过本节课的学习，你可以学到：

- 如何基于 Zustand 写一个 Todo 案例；
- 利用 Immer 简化你的代码；
- 状态选取 / 浅层比较；
- Zustand 中如何处理异步操作；
- 推荐 Zustand 的使用姿势。

在本章节中我们从一个 Todo 案例开始，介绍了 Zustand 的基本用法，并且通过单测模拟了在不同场景下 Zustand 的 re-render 情况，相信大家能够通过对代码仓库的练习进一步提升对 Zustand 的理解。

在下一章节中，我们将实现 Zustand 的核心部分。
