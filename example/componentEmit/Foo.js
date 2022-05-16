import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit('add', 1, 2)
    }
    const onCamelName = () => {
      emit('camel-name', 'hello')
    }

    return {
      emitAdd,
      onCamelName,
    }
  },
  render() {
    const btn = h('button', {
      onClick: this.emitAdd,
    }, 'emitAdd')
    const foo = h(
      'p', {}, [
        h('button', {
          onClick: this.onCamelName,
        },
        'CamelNameBtn'),
      ])
    return h('div', {}, [foo, btn])
  },
}
