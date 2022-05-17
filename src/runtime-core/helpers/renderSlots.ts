import { createVNode } from '../vnode'

export function renderSlots(slots, name) {
  // //如果插槽内容是数组，则将$slots看作是children(array) => vnode 数组字元素，放到vnode中渲染s
  // 具名插槽。获取对应name的插槽内容
  const slot = slots[name]
  if (slot) {
    return createVNode('div', {}, slot)
  }
}
