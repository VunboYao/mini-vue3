let activeEffect
export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

class ReactiveEffect {
  private _fn: any
  constructor(fn) {
    this._fn = fn
  }

  run() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeEffect = this
    this._fn()
  }
}

const targetMap = new Map()
export function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }
  dep.add(activeEffect)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  for (const effect of dep) {
    effect.run()
  }
}
