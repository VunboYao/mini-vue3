import { render } from './renderer'
import { createVNode } from './vnode'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先 vnode
      // !component => vnode
      // 所有的逻辑操作都会基于 vnode 处理
      const vnode = createVNode(rootComponent)

      if (typeof rootContainer === 'string') {
        rootContainer = document.querySelector(rootContainer)
      }
      render(vnode, rootContainer)
    },
  }
}
