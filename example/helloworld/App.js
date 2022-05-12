import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export default {
  render() {
    window.self = this
    // ui
    return h('div', {
      id: 'root',
      class: 'blue',
    },
    // `Hi, ${this.msg}`, // string
    [
      h('span', { class: 'red' }, 'Hello'),
      h('span', { class: 'blue' }, ' Vue3'),
    ],
    )
  },
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}
