import { getCurrentInstance, h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup() {
    const instance = getCurrentInstance()
    // eslint-disable-next-line no-console
    console.log('Foo', instance)
    return {}
  },
  render() {
    return h('div', {}, 'foo')
  },
}
