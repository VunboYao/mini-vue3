export function createVNode(type, props?, children?) {
  const vnode = {
    type, // 当前组件对象
    props,
    children,
    el: null,
  }
  return vnode
}
