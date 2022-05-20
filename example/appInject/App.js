import { h, inject, provide } from '../../lib/guide-mini-vue.esm.js'

let Consumer
let ProviderTwo
const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)])
  },
}

ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'fooValTwo')
    // provide('bar', 'barVal')
    const foo = inject('foo')
    return {
      foo,
    }
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo: -${this.foo}`), h(Consumer)])
  },
}

Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')

    return {
      foo,
      bar,
    }
  },
  render() {
    return h('div', {}, `Consumer: -${this.foo} - ${this.bar}`)
  },
}

export default {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(Provider)])
  },
}
