import { Fragment, createVNode } from '../vnode'
export function renderSlots(slots, name, props) {
  // //如果插槽内容是数组，则将$slots看作是children(array) => vnode 数组字元素，放到vnode中渲染s
  // 具名插槽。获取对应name的插槽内容
  const slot = slots[name]
  if (slot) {
    if (typeof slot === 'function') {
      // 函数时，作用域插槽。传入组件内的数据
      // Fragment: 避免对slots渲染的多余包裹
      return createVNode(Fragment, {}, slot(props))
    }
  }
}
