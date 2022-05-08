import { extend } from '../shared'

let activeEffect // reactiveEffect的实例
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // options
  // Object.assign(_effect, options)
  // extend
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect // 挂载effect到fn上
  return runner
}

class ReactiveEffect {
  private readonly _fn: any
  public scheduler?(): void
  deps = []
  active = true // 是否活跃的双向绑定，false则已经stop
  isStop = false // todo:自己实现的暂停跟踪
  onStop?(): void // 可选的回调
  constructor(fn: any, scheduler?: any) {
    this._fn = fn
    this.scheduler = scheduler
  }

  run() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeEffect = this
    return this._fn()
  }

  stop() {
    // 性能优化，避免反复去删除
    if (this.active) {
      cleanupEffect(this)
      this.onStop && this.onStop()
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.isStop = true // 当前effect已经停止
  effect.deps.forEach((dep: any) => {
    // 删除当前effect
    dep.delete(effect)
  })
  effect.deps.length = 0
}

const targetMap = new Map()
export function track(target, key) {
  if (!isTracking()) { return }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }

  trackEffects(dep)
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) { return }

  dep.add(activeEffect)
  // 反向收集所有执行Effect的dep
  activeEffect.deps.push(dep)
}

export function isTracking() {
  return activeEffect && !activeEffect.isStop
  // 如果没有effect函数,单纯的reactive,没有activeEffect
  // if (!activeEffect) { return }
  // 不能再追踪依赖
  // if (activeEffect.isStop) { return }
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects(dep) {
  // set结构的存储effect
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

// fn是effect内部执行的函数
export function stop(fn) {
  // 执行effect上的stop方法
  fn.effect.stop()
}
