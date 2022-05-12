import { mutableHandler, readonlyHandler, shallowReactiveHandler, shallowReadonlyHandler } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__is_Reactive',
  IS_READONLY = '__is_Readonly',
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandler)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandler)
}

// todo: 同reactive,readonly，传入原始数据与一个特有的handler
export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandler)
}

export function shallowReactive(raw) {
  return createReactiveObject(raw, shallowReactiveHandler)
}

// 触发 get操作
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value) {
  // 针对原始值，undefined转换成boolean
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

function createReactiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}
