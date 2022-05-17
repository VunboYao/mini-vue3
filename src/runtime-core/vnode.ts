import { isObject } from '../shared'
import { ShapeFlags } from '../shared/shapeFlags'

export const Fragment = Symbol('Fragment')

export function createVNode(type, props?, children?) {
  const vnode = {
    type, // 当前组件对象
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  }
  // 区分子元素是文本还是数组
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // component + children object slots标识
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

function getShapeFlag(type: any) {
  // 区分element还是状态组件
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
