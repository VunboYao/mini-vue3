import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: any
  private _dirty = true // 默认需要计算value值
  private _value: any
  private _effect: ReactiveEffect
  constructor(getter) {
    this._getter = getter
    // 收集依赖
    this._effect = new ReactiveEffect(getter)
  }

  get value() {
    // 控制value从缓存中获取。加锁
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
