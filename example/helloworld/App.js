import { h } from '../../lib/guide-mini-vue.esm.js'
export default {
  render() {
    // ui
    return h('div', `Hi, ${this.msg}`)
  },
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}
