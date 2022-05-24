import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options

  function render(vnode, container) {
    // patch => mount/update
    patch(vnode, container, null)
  }

  function patch(vnode, container, parentComponent) {
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
    const el = vnode.el = createElement(type)

    // * setAttribute
    for (const key in props) {
      const val = props[key]

      // !事件处理
      patchProp(el, key, val)
    }

    // * textContent
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    }

    // * appendChild
    // container.appendChild(el)
    insert(el, container)
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

  // 封装了渲染的所有逻辑。将内部render渲染暴露出去
  return {
    createApp: createAppAPI(render), // 真实的render渲染挂载方法
  }
}
