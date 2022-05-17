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
    return h('div', {}, [foo, renderSlots(this.$slots)])
  },
}
