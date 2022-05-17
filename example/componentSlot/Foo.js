import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup() {
    return {}
  },
  render() {
    const foo = h('p', {}, 'foo')
    // eslint-disable-next-line no-console
    console.log(this.$slots)
    // 数组传入到一个vnode函数中处理
    // 位置
    // 1.获取到要渲染的元素 => obj[key]
    // 2.获取到要渲染的位置
    const age = 18
    return h('div', {}, [
      renderSlots(this.$slots, 'header', { age }),
      foo,
      renderSlots(this.$slots, 'footer'),
    ])
  },
}
