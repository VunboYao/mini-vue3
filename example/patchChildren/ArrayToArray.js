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

// *3.新的比旧的多：左侧
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
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
]
const nextChildren = [
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
] */

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

// *5对比中间的部分
// 删除老的（在老的里面存在，新的里面不存在）
// *5.1
// a,b,(c,d),f,g
// b,b,(e,c),f,g
// D 节点在新的里面是没有的，删除
// C 节点 prop 发生变化
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C', id: 'c-prev' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'C', id: 'c-next' }, 'C'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
] */

// *5.1.1
// a,b,(c,e,d),f,g
// a,b,(e,c),f,g
// 中间部分，老的比新的多，多出来的直接删除
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C', id: 'c-prev' }, 'C'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'C', id: 'c-next' }, 'C'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
] */

// *5.2：节点存在于新的和老的里面，但是位置变了
// 5.2.1
// a,b,(c,d,e),f,g
// a,b,(e,c,d),f,g
// 最长子序列：[1,2]
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
] */
// *5.3：创建新节点
// a,b,(c,e),f,g
// a,b,(e,c,d),f,g
/* const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
] */

// *综合例子
// a,b,(c,d,e,z),f,g
// a,b,(d,c,y,e),f,g
const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'Z' }, 'Z'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'C' }, 'C'),
  h('p', { key: 'Y' }, 'Y'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
]
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
