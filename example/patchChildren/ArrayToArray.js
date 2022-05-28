// 老的是 Array
// 新的是 Array
import { h, ref } from '../../lib/guide-mini-vue.esm.js'
// *1.左侧对比
/*
* *指针：
* e1:旧的最后一个索引值
* e2:新的最后一个索引值
* i:指向前后不同的索引值
* i 不能大于 e1 和 e2
*/
// (a b) c
// (a b) d e
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
]

const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
] */

// *2.右侧对比
// a (b c)
// d e (b c)
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
]

const nextChildren = [
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
] */

// *3.新的比老的长：左侧
// (a b)
// (a b) c
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
] */

// 右侧
// (a b)
// c d (a b)
const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
]
const nextChildren = [
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
]

// *4.老的比新的长:左侧
// (a b) c
// (a b)
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
] */

// *右侧
// a (b c)
// (b c)
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
]
const nextChildren = [
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
] */
export default {
  name: 'ArrayToArray',
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
