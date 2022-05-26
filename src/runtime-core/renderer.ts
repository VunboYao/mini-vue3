import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

// render渲染器
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(vnode, container) {
    // patch => mount/update
    patch(null, vnode, container, null)
  }

  // n1 => old
  // n2 => new
  function patch(n1, n2, container, parentComponent) {
    // todo： component || element
    const { type, shapeFlag } = n2
    // console.log(type) // 组件是Object, element是字符串, Fragment slots

    switch (type) {
      // Fragment only render children
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 element
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  // 更新Element
  function patchElement(n1, n2, container, parentComponent) {
    console.log('patchElement', container)
    console.log(n1, n2)

    const oldProps = n1.props
    const newProps = n2.props

    const el = n2.el = n1.el
    patchChildren(n1, n2, el, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent) {
    // !老的children的类型
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    // !新的children的类型
    const { shapeFlag } = n2
    const c2 = n2.children // 获取需要设置的值
    // 新的是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // !老的是array，新的是text
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // *1.remove old children
        unmountChildren(n1.children)
      }
      if (c1 !== c2) {
        // *2.set NewText
        hostSetElementText(container, c2)
      }
    } else {
      // 新的是数组
      // * 判断旧的是文本
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // *1设置旧的为空
        hostSetElementText(container, '')
        // *2挂载新的元素
        mountChildren(c2, container, parentComponent)
      }
    }
  }
  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i]
      // !remove
      hostRemove(el)
    }
  }
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  // 挂载元素以及对应的属性
  function mountElement(vnode: any, container: any, parentComponent) {
    // type: div
    // props: attribute
    // children: string || array
    const { type, props, children, shapeFlag } = vnode

    // * hostCreateElement
    // vnode.el = div
    // ! 从外部传入的createElement中拿到挂载的元素
    const el = vnode.el = hostCreateElement(type)

    // * setAttribute
    for (const key in props) {
      const val = props[key]

      // !事件处理
      // !将属性挂载到el上
      hostPatchProp(el, key, null, val)
    }

    // * textContent
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    }

    // * appendChild
    // container.appendChild(el)
    // !利用外部的挂载方法
    hostInsert(el, container)
  }
  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent)
    })
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function setupRenderEffect(instance: any, initialVNode, container) {
    effect(() => {
      if (!instance.isMounter) {
        console.log('init')
        // 得到组件对应的虚拟dom
        const { proxy } = instance // 从实例中获取代理
        const subTree = instance.subTree = instance.render.call(proxy)
        // vnode => patch
        // initialVNode => element => mountElement
        patch(null, subTree, container, instance)

        // 所有的 element => mount
        initialVNode.el = subTree.el

        instance.isMounter = true // 已挂载
      } else {
        console.log('update')
        // 得到组件对应的虚拟dom
        const { proxy } = instance // 从实例中获取代理
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  // 封装了渲染的所有逻辑。将内部render渲染暴露出去
  return {
    createApp: createAppAPI(render), // 真实的render渲染挂载方法
  }
}
