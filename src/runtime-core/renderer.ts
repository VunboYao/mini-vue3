import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  // patch => mount/update
  patch(vnode, container)
}

function patch(vnode, container, parentComponent?) {
  // todo： component || element
  const { type, shapeFlag } = vnode
  // console.log(type) // 组件是Object, element是字符串, Fragment slots

  switch (type) {
    // Fragment only render children
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 element
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processComponent(vnode, container, parentComponent)
      }
  }
}
function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}
function mountElement(vnode: any, container: any, parentComponent) {
  // type: div
  // props: attribute
  // children: string || array
  const { type, props, children, shapeFlag } = vnode

  // * createElement
  // vnode.el = div
  const el = vnode.el = document.createElement(type)

  // * setAttribute
  for (const key in props) {
    const val = props[key]

    // !事件处理
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }

  // * textContent
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent)
  }

  // * appendChild
  container.appendChild(el)
}
function mountChildren(children, container, parentComponent) {
  children.forEach((v) => {
    patch(v, container, parentComponent)
  })
}

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVNode, container, parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance: any, initialVNode, container) {
  // 得到组件对应的虚拟dom
  const { proxy } = instance // 从实例中获取代理
  const subTree = instance.render.call(proxy)

  // vnode => patch
  // initialVNode => element => mountElement
  patch(subTree, container, instance)

  // 所有的 element => mount
  initialVNode.el = subTree.el
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode.children, container, parentComponent)
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}
