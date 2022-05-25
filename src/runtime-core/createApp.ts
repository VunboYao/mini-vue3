import { createVNode } from './vnode'

// 拿到render方法
export function createAppAPI(render) {
  // 将真实的render暴露出去
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 先 vnode
        // !component => vnode
        // 所有的逻辑操作都会基于 vnode 处理
        const vnode = createVNode(rootComponent)

        if (typeof rootContainer === 'string') {
          rootContainer = document.querySelector(rootContainer)
          // !监测传入的挂载元素是否是合理的
          if (rootContainer === null) {
            console.warn(`The rootContainer ${rootContainer} isn't a elementNode`)
          }
        }
        render(vnode, rootContainer)
      },
    }
  }
}
