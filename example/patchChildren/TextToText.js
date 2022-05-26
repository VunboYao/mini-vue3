// 新的是 Text
// 老的是 Text
import { h, ref } from '../../lib/guide-mini-vue.esm.js'

const nextChildren = 'newChildren'
const prevChildren = 'oldChildren'
export default {
  name: 'TextToText',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange,
    }
  },
  render() {
    return this.isChange === true
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren)
  },
}
