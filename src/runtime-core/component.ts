import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

// 创建组件实例，props,slots,provides,emit等初始化
export function createComponentInstance(vnode: any, parent) {
  // eslint-disable-next-line no-console
  console.log('createComponentInstance', parent)
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}, // todo:组件实例上初始化setupState || function
    props: {}, // 父级传入的属性
    slots: {}, // 实例上的slots映射 vnode.children
    provides: parent ? parent.provides : {}, // 组件实例的provides指向parent的provides
    parent,
    emit: () => { },
  }

  // 挂载到组件实例上
  // todo:通过bind，第一个参数传入的是component，用户后续传入其他参数，不需要传入第一个实例
  component.emit = emit.bind(null, component) as any
  return component
}

// 组件初始化：props,slots,setup等并代理到组件实例上
export function setupComponent(instance) {
  // *组件setup前，将props数据传入
  initProps(instance, instance.vnode.props)

  // 初始化插槽
  initSlots(instance, instance.vnode.children)

  // *组件setup处理
  setupStatefulComponent(instance)

  // !ctx 创建一个代理，方便直接通过this获取setupState上的数据.
  // *组件数据代理，$el, setup，props，$slots
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
}

// 生成一个有状态的组件
function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  if (setup) {
    // !获取currentInstance前置方法：只能在setup中调用该API
    setCurrentInstance(instance)

    // todo: ?function / object
    // *传入组件的props是shallowReadonly浅只读的
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit, // 利用实例挂载emit
    })
    // !关闭获取currentInstance的后置方法：只能在setup中调用该API
    setCurrentInstance(null)

    // 将setup的数据挂载到instance.setupState上
    handleSetupResult(instance, setupResult)
  }
}

// 将setup返回的结果挂载到实例上
function handleSetupResult(instance, setupResult: any) {
  // function || Object
  // todo: function
  if (typeof setupResult === 'object') {
    // !如果setup的返回是一个对象，将返回结果赋值到组件实例上
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

// 结束setup处理
function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}

let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}

// todo:方便全局跟踪，中间层，防止变量被意外修改导致的bug
export function setCurrentInstance(instance) {
  currentInstance = instance
}
