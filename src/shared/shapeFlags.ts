export const enum ShapeFlags {
  ELEMENT = 1, // 0001 element元素
  STATEFUL_COMPONENT = 1 << 1, // 0010 组件
  TEXT_CHILDREN = 1 << 2, // 0100 文本
  ARRAY_CHILDREN = 1 << 3, // 1000 数组
  SLOT_CHILDREN = 1 << 4,
}
