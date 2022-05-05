import { track, trigger } from './effect'

function createGetter(isReadonly = false) {
  return function get(target, key) {
    const result = Reflect.get(target, key)
    if (!isReadonly) {
      track(target, key)
    }
    return result
  }
}
function createSetter() {
  return function set(target, key, value) {
    const result = Reflect.set(target, key, value)
    trigger(target, key)
    return result
  }
}

// 优化，不需要反复的调用
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

export const mutableHandler = {
  get,
  set,
}

export const readonlyHandler = {
  get: readonlyGet,
  set(target) {
    console.warn(`${target} is readonly`)
    return true
  },
}
