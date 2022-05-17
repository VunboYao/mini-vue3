const extend = Object.assign;
function isObject(val) {
    return val !== null && typeof val === 'object';
}
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
// 首字母大写
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 拼接onXxx
const toHandlerKey = (str) => {
    return str ? `on${capitalize(str)}` : '';
};
// kebabCase => camelCase
const camelCase = (str) => {
    return str.replace(/-(\w)/g, (_, t) => {
        return t ? t.toUpperCase() : '';
    });
};

const targetMap = new Map();
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    // set结构的存储effect
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        // todo: is_xxx judge
        if (key === "__is_Reactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__is_Readonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const result = Reflect.get(target, key);
        // todo: shallowReadonly
        if (shallow) {
            return result;
        }
        // todo: nested
        if (isObject(result)) {
            return isReadonly ? readonly(result) : reactive(result);
        }
        return result;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const result = Reflect.set(target, key, value);
        trigger(target, key);
        return result;
    };
}
// 优化，不需要反复的调用
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReactiveGet = createGetter(false, true);
const mutableHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`${key} set failed, target is readonly`);
        return true;
    },
};
// todo: extends the readonlyHandler
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet,
});
extend({}, mutableHandler, {
    get: shallowReactiveGet,
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandler);
}
// todo: 同reactive,readonly，传入原始数据与一个特有的handler
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandler);
}
function createReactiveObject(raw, baseHandler) {
    return new Proxy(raw, baseHandler);
}

function emit(instance, event, ...args) {
    // instance.props => event
    const { props } = instance;
    // TPP
    // 先去写一个特定的行为 => 重构成通用的行为
    /*
    const handler = props.onAdd
    handler && handler()
    */
    const handleName = toHandlerKey(camelCase(event));
    const handler = props[handleName];
    handler && handler(...args); // 参数处理
}

// *处理props，传入至实例上
function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.$slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // todo:处理setupState, props
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // key => $el
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

// 将组件的子元素挂载到组件的$slots上
function initSlots(instance, children) {
    instance.$slots = Array.isArray(children) ? children : [children];
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
    };
    // 挂载到组件实例上
    // todo:通过bind，第一个参数传入的是component，用户后续传入其他参数，不需要传入第一个实例
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // *组件setup前，将props数据传入
    initProps(instance, instance.vnode.props);
    // 初始化插槽
    initSlots(instance, instance.vnode.children);
    // *组件setup处理
    setupStatefulComponent(instance);
    // !ctx 创建一个代理，方便直接通过this获取setupState上的数据.
    // *组件数据代理，$el, setup，props，$slots
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
}
// 生成一个有状态的组件
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // function / object
        // *传入组件的props是shallowReadonly浅只读的
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit, // 利用实例挂载emit
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function || Object
    // todo: function
    if (typeof setupResult === 'object') {
        // !如果setup的返回是一个对象，将返回结果赋值到组件实例上
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
    const { shapeFlag } = vnode;
    // console.log(type) // 组件是Object, element是字符串
    if (shapeFlag & 1 /* ELEMENT */) {
        // 处理 element
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
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
    const { type, props, children, shapeFlag } = vnode;
    // * createElement
    // vnode.el = div
    const el = vnode.el = document.createElement(type);
    // * setAttribute
    for (const key in props) {
        const val = props[key];
        // !事件处理
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // * textContent
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
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
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    // 得到组件对应的虚拟dom
    const { proxy } = instance; // 从实例中获取代理
    const subTree = instance.render.call(proxy);
    // vnode => patch
    // initialVNode => element => mountElement
    patch(subTree, container);
    // 所有的 element => mount
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    // 区分子元素是文本还是数组
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    // 区分element还是状态组件
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
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

function renderSlots(slots) {
    // 如果插槽内容是数组，则将$slots看作是children(array) => vnode 数组字元素，放到vnode中渲染s
    return createVNode('div', {}, slots);
}

export { createApp, h, renderSlots };
