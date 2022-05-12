import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export default {
  name: 'APP',
  render() {
    window.self = this
    // ui
    return h('div',
      {
        id: 'root',
        class: 'blue',
        onClick() {
          // eslint-disable-next-line no-console
          console.log('click')
        },
        onMousedown() {
          // eslint-disable-next-line no-console
          console.log('mousedown')
        },
      },
      [
        h('div', { class: 'red' }, `hi,${this.msg}`),
        h(Foo,
          {
            count: 1,
          },
        )],
      // `Hi, ${this.msg}`, // string
      // [
      //   h('span', { class: 'red' }, 'Hello'),
      //   h('span', { class: 'blue' }, ' Vue3'),
      // ],
    )
  },
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}
