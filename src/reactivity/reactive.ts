import { mutableHandler, readonlyHandler } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__is_Reactive',
  IS_READONLY = '__is_Readonly',
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandler)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandler)
}

// 触发 get操作
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isReactive(value) {
  // 针对原始值，undefined转换成boolean
  return !!value[ReactiveFlags.IS_REACTIVE]
}

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}
