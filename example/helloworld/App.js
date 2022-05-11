export const App = {
  render() {
    // ui
    // eslint-disable-next-line no-undef
    return h('div', `Hi, ${this.msg}`)
  },
  setup() {
    return {
      msg: 'mini-vue',
    }
  },
}
