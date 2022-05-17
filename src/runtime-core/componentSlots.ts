// 将组件的子元素挂载到组件的$slots上
export function initSlots(instance, children) {
  instance.$slots = Array.isArray(children) ? children : [children]
}
