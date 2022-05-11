export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
  }
  return component
}
export function setupComponent(instance) {
  // todo
  // initProps
  // initSlots
  setupStatefulComponent(instance)
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
  if (!Component.render) {
    Component.render = instance.render
  }
}
