

export const isObject = value => {
  if (!value) {
    return false
  }
  if (Array.isArray(value)) {
    return false
  }
  return typeof value === 'object'
}

export const usePromise = () => {
  let resolve
  let reject
  const promise = new Promise((resolver, rejector) => {
    resolve = resolver
    reject = rejector
  })
  return [promise, resolve, reject]
}

export const promisify = (fn, thisArg) => {
  return function(options, ...args) {
    const [promise, success, fail] = usePromise()
    const config = Object.assign({}, options || {}, { success, fail })
    fn.apply(thisArg, [config, ...args])
    return promise
  }
}

export const omit = (obj, ...keys) => {
  const props = [].concat.apply([], keys)
  const omits = props.reduce((acc, item) => {
    acc[item] = true
    return acc
  }, {})
  return Object.keys(obj).reduce((acc, item) => {
    return omits[item] ? acc : Object.assign(acc, { [item]: obj[item] })
  }, {})
}

export const eventActionFactory = options => {
  let busying = null
  return function(event) {
    console.log('event: ', event)
    if (busying) {
      return
    }
    busying = true

    const free = () => {
      busying = null
    }

    const exec = fn => (...args) => {
      return typeof fn === 'function' ? fn.apply(this, args) : undefined
    }
  
    const { store, breaker, emit, defaultAction, customActionParams } = isObject(options) ? options : {}

    const getPayload = payload => {
      const context = this
      return Object.assign({ context, event }, payload || {})
    }

    const getStore = () => {
      const value = typeof store === 'function' ? exec(store)(getPayload()) : store
      return { store: value }
    }

    if (exec(breaker)(getPayload(getStore()))) {
      return free()
    }
    
    let isPreventDefault = false
    let calledNext = false

    const preventDefault = () => {
      isPreventDefault = true
    }

    const next = customAction => {
      if (calledNext) {
        return
      }
      calledNext = true
      if (typeof customAction !== 'function') {
        return free()
      }
      let params = []
      if (typeof customActionParams === 'function') {
        params = exec(customActionParams)(getPayload(getStore()))
        params = Array.isArray(params) ? params : [params]
      } else if(Array.isArray(customActionParams)) {
        params = customActionParams
      } else {
        params = [customActionParams]
      }
      const result = exec(customAction).call(this, getPayload(), ...params)
      Promise.resolve(result).finally(free)
    }
    exec(emit)(Object.assign({}, getPayload(), getStore(), { preventDefault, next }))
    if (!isPreventDefault) {
      const result = exec(defaultAction)(getPayload(getStore()))
      Promise.resolve(result).finally(free)
    }
  }
}