import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export default {
  name: 'App',
  render() {
    const app = h('div', {}, 'App')
    const foo = h(Foo)

    return h('div', {}, [app, foo])
  },
  setup() {
    return {}
  },
}
