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
    patch(null, vnode, container, null, null)
  }

  // n1 => old
  // n2 => new
  function patch(n1, n2, container, parentComponent, anchor) {
    // todo： component || element
    const { type, shapeFlag } = n2
    // console.log(type) // 组件是Object, element是字符串, Fragment slots

    switch (type) {
      // Fragment only render children
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理 element
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parentComponent, anchor)
        }
    }
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  // 更新Element
  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement', container)
    console.log(n1, n2)

    const oldProps = n1.props
    const newProps = n2.props

    const el = n2.el = n1.el
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    /*
    * n1: oldNode1
    * n2: newNode2
    * c: children
    * e: end
    *  */

    // *老的children的类型
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children

    // *新的children的类型
    const { shapeFlag } = n2
    const c2 = n2.children // 获取需要设置的值

    // *新的是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // todo:1.老的是array，新的是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // *1.remove old children
        unmountChildren(n1.children)
      }
      if (c1 !== c2) {
        // *todo:2.老的是文本，新的是文本
        hostSetElementText(container, c2)
      }
    } else {
      // * 新的是数组
      // todo:3.老的是文本，新的是数组
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 设置旧的为空
        hostSetElementText(container, '')
        // 挂载新的元素
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // todo:4.老的是数组，新的也是数组
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    /*
    * i: index 新旧node不同时的索引
    * c: children
    * e: end  (c.length = 1)
    * n1: node1
    * l2： c2.length
    *  */

    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    function isSomeVNodeType(n1, n2) {
      // type
      // key
      return n1.type === n2.type && n1.key === n2.key
    }

    // !1.左侧开始：索引小于新旧的长度
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++ // todo:计算出新旧不同的索引值
    }

    // !2.右侧比对
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1] // 从右侧开始遍历
      const n2 = c2[e2]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1-- // 右侧向左移动，下标--
      e2--
    }

    // !3新的比老的多=> 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1 // 锚点指向
        // todo：如果nextPos >= l2 ，则是插入到末尾。 如果小于，则是异同点，往前插入
        const anchor = nextPos >= l2
          ? null
          : c2[nextPos].el // insertBefore插入的锚点需要指向真实的DOM元素el

        // *多个数据的遍历插入
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) { // !4 老的比新的多, 删除
      while (i <= e1) { // 大于e2 并且 <= e1 的移除
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // !5 中间对比
      /*
      * s1: 开始索引
      * e2: 结束索引
      *  */
      const s1 = i
      const s2 = i
      const toBePatched = e2 - s2 + 1 // 获取需要遍历的最佳区间
      let patched = 0

      let moved = false // 优化：是否需要移动
      let maxNewIndexSoFar = 0 // 优化：索引判断是否需要移动

      // 遍历新节点的diff => map[key, i]
      const keyToNewIndexMap = new Map()
      // 新索引与旧索引的映射表
      const newIndexToOldIndexMap = new Array(toBePatched) // 定长数组，优化性能
      for (let i = 0; i < toBePatched; i++) { newIndexToOldIndexMap[i] = 0 } // 初始化一个映射信息，默认为0时，需要新建。

      // 遍历新节点的区间，存储 key:index
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      // !5.1删除：遍历老节点的diff:此处遍历的是旧节点的差异部分e1-s1
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        // 优化：遍历老节点的时，如果已经达到了新节点最佳区间。后续直接删除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        let newIndex
        // !null undefined 有 key 的比对，性能优化。直接从映射中获取索引
        if (prevChild.key != null) {
          // 查看新节点是否存在于老节点
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          // !没有key值，遍历新节点
          for (let j = s2; j <= e2; j++) {
            // 判断是否相同
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j // 查找到相同节点，获取索引退出
              break
            }
          }
        }

        // 节点在新的中不存在
        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          // 优化：通过比对索引，判断是否移动过
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          // 避免 i = 0 是没有建立映射表
          newIndexToOldIndexMap[newIndex - s2] = i + 1 // s2 === s1
          // 存在则进行比对
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      // !5.2移动&新增:最长递增子序列
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1 // 递增子序列指针

      // 倒序插入
      for (let i = toBePatched - 1; i >= 0; i--) {
        const index = i + s2 // 倒序遍历新节点的索引
        const child = c2[index] // 或许比对的node
        const anchor = index + 1 >= l2 ? null : c2[index + 1].el
        /*
          * 递增子序列：[1,2]
          * [0,1,2]
          *  */
        // 新增
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, child, container, parentComponent, anchor)
        } else if (moved) {
          // 移动
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            console.log('move node')
            hostInsert(child.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el // fix:此处需要获取到el元素，否则无法正确移除el
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
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
      mountChildren(children, el, parentComponent, anchor)
    }

    // * appendChild
    // container.appendChild(el)
    // !利用外部的挂载方法
    hostInsert(el, container, anchor)
  }
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function updateComponent(n1, n2) {
    const instance = n2.component = n1.component
    instance.next = n2
    instance.update()
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function setupRenderEffect(instance: any, initialVNode, container, anchor) {
    instance.update = effect(() => {
      if (!instance.isMounter) {
        console.log('init')
        // 得到组件对应的虚拟dom
        const { proxy } = instance // 从实例中获取代理
        const subTree = instance.subTree = instance.render.call(proxy)
        // vnode => patch
        // initialVNode => element => mountElement
        patch(null, subTree, container, instance, anchor)

        // 所有的 element => mount
        initialVNode.el = subTree.el

        instance.isMounter = true // 已挂载
      } else {
        console.log('update')
        //
        // 得到组件对应的虚拟dom
        const { proxy } = instance // 从实例中获取代理
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }

  function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }

  function getSequence(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
          p[i] = j
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        while (u < v) {
          c = (u + v) >> 1
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
  }

  // 封装了渲染的所有逻辑。将内部render渲染暴露出去
  return {
    createApp: createAppAPI(render), // 真实的render渲染挂载方法
  }
}
