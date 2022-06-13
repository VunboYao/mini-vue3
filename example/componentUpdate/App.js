import { h, ref } from '../../lib/guide-mini-vue.esm.js'
import child from './child.js'
export const App = {
  name: 'App',
  setup() {
    const msg = ref('123')
    const count = ref(1)
    window.msg = msg

    const changeChildProps = () => {
      msg.value = '456'
    }

    const changeCount = () => {
      count.value++
    }

    return {
      msg,
      changeCount,
      changeChildProps,
      count,
    }
  },
  render() {
    return h('div', {}, [
      h('div', {}, 'Hello'),
      h(
        'button',
        {
          onClick: this.changeChildProps,
        },
        'changeChildProps',
      ),
      h(child, {
        msg: this.msg,
      }),
      h(
        'button',
        {
          onClick: this.changeCount,
        },
        'changeSelfCount',
      ),
      h('p', {}, `count: ${this.count}`),
    ])
  },
}
