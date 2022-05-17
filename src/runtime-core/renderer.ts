import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  // patch => mount/update
  patch(vnode, container)
}

function patch(vnode, container) {
  // todo： component || element
  const { type, shapeFlag } = vnode
  // console.log(type) // 组件是Object, element是字符串, Fragment slots

  switch (type) {
    // Fragment only render children
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 element
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processComponent(vnode, container)
      }
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

function processFragment(vnode: any, container: any) {
  mountChildren(vnode.children, container)
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}
