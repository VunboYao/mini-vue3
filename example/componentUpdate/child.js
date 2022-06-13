import { h } from '../../lib/guide-mini-vue.esm.js'

export default {
  name: 'Child',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(props, { emit }) {},
  render() {
    return h('div', {}, [h('div', {}, `child-props-msg:${this.$props.msg}`)])
  },
}
