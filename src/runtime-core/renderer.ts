import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch => mount/update
  patch(vnode, container)
}

function patch(vnode, container) {
  // todo： component || element
  const { type } = vnode
  // console.log(type) // 组件是Object, element是字符串
  if (typeof type === 'string') {
    // 处理 element
    processElement(vnode, container)
  } else if (isObject(type)) {
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
  const { type, props, children } = vnode

  // * createElement
  const el = document.createElement(type)

  // *setAttribute
  for (const key in props) {
    el.setAttribute(key, props[key])
  }

  // * textContent
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
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

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance: any, container) {
  // 得到组件对应的虚拟dom
  const { proxy } = instance // 从实例中获取代理
  const subTree = instance.render.call(proxy)

  // vnode => patch
  // vnode => element => mountElement
  patch(subTree, container)
}
