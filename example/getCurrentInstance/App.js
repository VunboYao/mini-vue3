import { getCurrentInstance, h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

export default {
  name: 'App',
  render() {
    return h('div', {}, [h('p', {}, 'currentInstance demo'), h(Foo)])
  },
  setup() {
    const instance = getCurrentInstance()
    // eslint-disable-next-line no-console
    console.log('App: ', instance)
  },
}
