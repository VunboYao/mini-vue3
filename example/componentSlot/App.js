import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export default {
  name: 'App',
  render() {
    const app = h('div', {}, 'App')
    // 本质是将Foo组件的children，vnode.children展示
    // 通过object[key]获取要渲染的元素
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => h('p', {}, `header slot ${age}`),
        footer: () => h('p', {}, 'footer slot'),
      })
    // const foo = h(Foo, {}, h('p', {}, 'singleSlot'))
    return h('div', {}, [app, foo])
  },
  setup() {
    return {}
  },
}
