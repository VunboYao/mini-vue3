import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export default {
  name: 'App',
  render() {
    const app = h('div', {}, 'App')
    // 本质是将Foo组件的children，vnode.children展示
    /* const foo = h(Foo, {}, [
      h('p', {}, 'slot'),
      h('p', {}, 'array slot'),
    ]) */
    const foo = h(Foo, {}, h('p', {}, 'singleSlot'))
    return h('div', {}, [app, foo])
  },
  setup() {
    return {}
  },
}
