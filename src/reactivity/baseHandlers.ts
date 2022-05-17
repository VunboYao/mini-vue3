import { extend, isObject } from '../shared'
import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    // todo: is_xxx judge
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const result = Reflect.get(target, key)

    // todo: first judge
    if (!isReadonly) {
      track(target, key)
    }
    // todo: shallowReadonly
    if (shallow) {
      return result
    }

    // todo: nested
    if (isObject(result)) {
      return isReadonly ? readonly(result) : reactive(result)
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
const shallowReadonlyGet = createGetter(true, true)
const shallowReactiveGet = createGetter(false, true)

export const mutableHandler = {
  get,
  set,
}

export const readonlyHandler = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`${key} set failed, target is readonly`)
    return true
  },
}

// todo: extends the readonlyHandler
export const shallowReadonlyHandler = extend({}, readonlyHandler, {
  get: shallowReadonlyGet,
})

export const shallowReactiveHandler = extend({}, mutableHandler, {
  get: shallowReactiveGet,
})
