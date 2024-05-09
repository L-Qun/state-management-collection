type Listener = () => void

export class Subscribable<TListener extends Function = Listener> {
  protected listeners: Set<TListener>

  constructor() {
    this.listeners = new Set()
  }

  // 进行订阅，这里传入的`listener`就是触发组件重新re-render的函数
  subscribe(listener: TListener): () => void {
    this.listeners.add(listener)
    // 返回一个函数用来取消监听
    return () => {
      this.listeners.delete(listener)
    }
  }
}
