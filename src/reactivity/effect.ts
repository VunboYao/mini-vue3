
class ReactiveEffect{
  private readonly _fn: any
  constructor(fn) {
    this._fn = fn
  }
  run() {
    // todo:获取当前实例 fn
    activeEffect = this
    return this._fn()
  }
}

const targetMap = new Map()
export function track(target, key) {
  // todo:target => Map()
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // todo: key => Set()
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  // !依赖收集
  dep.add(activeEffect)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  for(const effect of dep) {
    effect.run()
  }
}

// !获取当前 fn
let activeEffect
export function effect(fn) {
  // fn 需要立即执行
  const _effect = new ReactiveEffect(fn)
  _effect.run()

  return _effect.run.bind(_effect)
}
