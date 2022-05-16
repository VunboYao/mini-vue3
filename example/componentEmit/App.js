import { createApp, h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
  name: 'App',
  render() {
    return h('div', {}, [
      h('div', {}, 'App'),
      h(Foo, {
        onAdd(a, b) {
          // eslint-disable-next-line no-console
          console.log('App add', a, b)
        },
        onCamelName(app, b) {
          // eslint-disable-next-line no-console
          console.log('App camel-name', app, b)
        },
      })])
  },
  setup() {
    return {}
  },
}
createApp(App).mount('#app')
