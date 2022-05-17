import { ShapeFlags } from '../shared/shapeFlags'

// 将组件的子元素挂载到组件的$slots上
export function initSlots(instance, children) { // children is object
  // slot的children是对象形式
  // !children, slots赋值
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}
function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key]
    // value => slot
    slots[key] = props => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
