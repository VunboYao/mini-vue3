import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  name: 'Foo',
  setup(props) {
    // eslint-disable-next-line no-console
    console.log(props)
    props.count++
    // eslint-disable-next-line no-console
    console.log(props)
  },
  render() {
    return h('div', {}, `foo: ${this.count}`)
  },
}
