import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: any
  private _dirty = true // 默认需要计算value值
  private _value: any
  private _effect: ReactiveEffect
  constructor(getter) {
    this._getter = getter
    // 收集依赖
    this._effect = new ReactiveEffect(getter, () => {
      // trigger 触发时，执行scheduler，更改 dirty.
      // 下一次get value 获取数据时，才是新的
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    // 控制value从缓存中获取。加锁
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run() // get value时执行第一次的getter
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}

/*
* 1. 传入一个 getter 函数
* 2. 建立一个 ReactiveEffect 依赖映射
* 3. 获取 get(value) 时，执行 getter 函数，获取 reactive => value.foo => track 收集 foo 与 getter 的映射信息
* 4. 返回 value.foo
* 5. 设置 value.foo = 2 时，触发 setter, 执行 trigger => scheduler => this._dirty = true
* 6. 再次获取 cValue.value 时，重新执行 this._effect.run() === getter() => track()
* 7. 得到新的值
* */
