import { getCurrentInstance } from './component'

export function provide(key, value) {
  // 获取组件实例
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    // 从组件中获取provides
    const { provides } = currentInstance
    // 将对应的值存储起来
    provides[key] = value
  }
}
export function inject(key) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    // 从父组件中获取对应的provides
    const parentProvides = currentInstance.parent.provides
    return parentProvides[key]
  }
}
