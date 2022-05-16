import { shallowReadonly } from '../reactivity/reactive'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}, // todo:组件实例上初始化setupState || function
    props: {}, // 父级传入的属性
  }
  return component
}
export function setupComponent(instance) {
  // *组件setup前，将props数据传入
  initProps(instance, instance.vnode.props)

  // todo:initSlots

  // *组件setup处理
  setupStatefulComponent(instance)

  // !ctx 创建一个代理，方便直接通过this获取setupState上的数据.
  // *组件数据代理，$el, setup，props
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
}

// 生成一个有状态的组件
function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  if (setup) {
    // function / object
    // *传入组件的props是shallowReadonly浅只读的
    const setupResult = setup(shallowReadonly(instance.props))

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function || Object
  // todo: function
  if (typeof setupResult === 'object') {
    // !如果setup的返回是一个对象，将返回结果赋值到组件实例上
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
