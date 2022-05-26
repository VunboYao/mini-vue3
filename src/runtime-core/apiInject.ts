import { getCurrentInstance } from './component'

export function provide(key, value) {
  // 获取组件实例
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    // 从组件中获取provides
    let { provides } = currentInstance
    // 组件实例初始化时，provides = parent.provides
    // provides是引用地址，如果此时直接修改，会导致覆盖父级的元素
    const parentProvides = currentInstance.parent.provides
    // !init时，当前组件的provides === parentProvides。将其存储为自己的原型
    if (provides === parentProvides) {
      // 组件中获取provides优先去父级组件获取。
      // Object.create()使用现有对象作为新创建对象的原型
      // {}.__proto__ = parentProvides
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    // 将对应的值存储起来
    provides[key] = value
  }
}
export function inject(key, value) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    // todo:从父组件中获取对应的provides
    const parentProvides = currentInstance.parent.provides
    if (key in parentProvides) {
      return parentProvides[key]
    } else if (value) {
      if (typeof value === 'function') {
        return value()
      }
      return value
    }
  }
}
