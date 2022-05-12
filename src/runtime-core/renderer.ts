import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch => mount/update
  patch(vnode, container)
}

function patch(vnode, container) {
  // todo： component || element
  const { shapeFlag } = vnode
  // console.log(type) // 组件是Object, element是字符串
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // 处理 element
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 处理组件
    processComponent(vnode, container)
  }
}
function processElement(vnode, container) {
  mountElement(vnode, container)
}
function mountElement(vnode: any, container: any) {
  // type: div
  // props: attribute
  // children: string || array
  const { type, props, children, shapeFlag } = vnode

  // * createElement
  // vnode.el = div
  const el = vnode.el = document.createElement(type)

  // *setAttribute
  for (const key in props) {
    el.setAttribute(key, props[key])
  }

  // * textContent
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
  }

  // * appendChild
  container.appendChild(el)
}
function mountChildren(children, container) {
  children.forEach((v) => {
    patch(v, container)
  })
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance: any, initialVNode, container) {
  // 得到组件对应的虚拟dom
  const { proxy } = instance // 从实例中获取代理
  const subTree = instance.render.call(proxy)

  // vnode => patch
  // initialVNode => element => mountElement
  patch(subTree, container)

  // 所有的 element => mount
  initialVNode.el = subTree.el
}
