// 将组件的子元素挂载到组件的$slots上
export function initSlots(instance, children) { // children is object
  // slot的children是对象形式
  // !children, slots赋值
  normalizeObjectSlots(children, instance.slots)
}
function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key]
    // value => slot
    slots[key] = normalizeSlotValue(value)
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
