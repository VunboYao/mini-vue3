import { createVNode } from '../vnode'

export function renderSlots(slots) {
  // 如果插槽内容是数组，则将$slots看作是children(array) => vnode 数组字元素，放到vnode中渲染s
  return createVNode('div', {}, slots)
}
