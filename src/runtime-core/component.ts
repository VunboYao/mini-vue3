export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: null, // 组件实例上初始化setupState
  }
  return component
}
export function setupComponent(instance) {
  // todo
  // initProps
  // initSlots
  setupStatefulComponent(instance)

  // ctx 创建一个代理，方便直接通过this获取setupState上的数据
  instance.proxy = new Proxy({}, {
    get(target, key) {
      // setupState
      const { setupState } = instance
      if (key in setupState) {
        return setupState[key]
      }
    },
  })
}

function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component
  if (setup) {
    // function / object
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // todo: function
  if (typeof setupResult === 'object') {
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
