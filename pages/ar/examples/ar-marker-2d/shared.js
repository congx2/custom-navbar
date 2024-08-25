
export const usePromise = () => {
  let resolve
  let reject
  const promise = new Promise((s, j) => {
    resolve = s
    reject = j
  })
  return [promise, resolve, reject]
}

export const delay = timeout => {
  const [promise, resolve] = usePromise()
  setTimeout(resolve, timeout)
  return promise
}
