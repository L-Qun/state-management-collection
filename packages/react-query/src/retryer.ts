interface RetryerConfig<TData = unknown, TError = Error> {
  fn: () => TData | Promise<TData> // 请求函数
  onError?: (error: TError) => void // 请求失败后的回调
  onSuccess?: (data: TData) => void // 请求成功后的回调
}

export interface Retryer<TData = unknown> {
  promise: Promise<TData>
}

export function createRetryer<TData = unknown, TError = Error>(
  config: RetryerConfig<TData, TError>,
): Retryer<TData> {
  let promiseResolve: (data: TData) => void
  let promiseReject: (error: TError) => void

  const promise = new Promise<TData>((outerResolve, outerReject) => {
    promiseResolve = outerResolve
    promiseReject = outerReject
  })

  const resolve = (value: any) => {
    config.onSuccess?.(value)
    promiseResolve(value)
  }

  const reject = (value: any) => {
    config.onError?.(value)
    promiseReject(value)
  }

  const run = () => {
    let promiseOrValue: any
    try {
      // 执行异步请求
      promiseOrValue = config.fn()
    } catch (error) {
      promiseOrValue = Promise.reject(error)
    }
    Promise.resolve(promiseOrValue)
      .then(resolve)
      .catch((error) => {
        reject(error)
        return
      })
  }

  run()

  return {
    promise,
  }
}
