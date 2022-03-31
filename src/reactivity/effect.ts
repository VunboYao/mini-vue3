import { extend } from '../shared'

class ReactiveEffect{
  deps = []
  active = true
  onStop?: () => void
  private readonly _fn: any
  public scheduler?: () => null

  // !定义scheduler为public，外部可用，可选
  constructor(fn, scheduler?: () => null) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    // todo:获取当前实例 fn
    activeEffect = this
    return this._fn()
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep:any) => {
    dep.delete(effect)
  })
}

const targetMap = new Map()
export function track(target, key) {
  if (!activeEffect) return
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
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  for (const effect of dep) {
    // scheduler的处理，有该选项时执行该函数
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

// !获取当前 fn
let activeEffect
export function effect(fn, options:any = {}) {
  const scheduler = options.scheduler
  // fn 需要立即执行
  const _effect = new ReactiveEffect(fn, scheduler)
  // todo:options
  // _effect.onStop = options.onStop
  // Object.assign(_effect, options)
  // todo: extend
  extend(_effect, options)

  _effect.run()

  const runner:any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}


export function stop(runner) {
  runner.effect.stop()
}
