import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch => mount/update
  patch(vnode, container)
}

function patch(vnode, container) {
  // todo： component || element
  // 处理 element
  // processElement()
  // 处理组件
  processComponent(vnode, container)
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container) {
  const subTree = instance.render()

  // vnode => patch
  // vnode => element => mountElement

  patch(subTree, container)
}
