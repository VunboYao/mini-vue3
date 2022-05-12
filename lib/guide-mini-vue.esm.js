function isObject(val) {
    return val !== null && typeof val === 'object';
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        // key => $el
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: null, // 组件实例上初始化setupState
    };
    return component;
}
function setupComponent(instance) {
    // todo
    // initProps
    // initSlots
    setupStatefulComponent(instance);
    // ctx 创建一个代理，方便直接通过this获取setupState上的数据
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // function / object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // todo: function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // patch => mount/update
    patch(vnode, container);
}
function patch(vnode, container) {
    // todo： component || element
    const { type } = vnode;
    // console.log(type) // 组件是Object, element是字符串
    if (typeof type === 'string') {
        // 处理 element
        processElement(vnode, container);
    }
    else if (isObject(type)) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // type: div
    // props: attribute
    // children: string || array
    const { type, props, children } = vnode;
    // * createElement
    // vnode.el = div
    const el = vnode.el = document.createElement(type);
    // *setAttribute
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    // * textContent
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    // * appendChild
    container.appendChild(el);
}
function mountChildren(children, container) {
    children.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    // 得到组件对应的虚拟dom
    const { proxy } = instance; // 从实例中获取代理
    const subTree = instance.render.call(proxy);
    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container);
    // 所有的 element => mount
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先 vnode
            // !component => vnode
            // 所有的逻辑操作都会基于 vnode 处理
            const vnode = createVNode(rootComponent);
            if (typeof rootContainer === 'string') {
                rootContainer = document.querySelector(rootContainer);
            }
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
