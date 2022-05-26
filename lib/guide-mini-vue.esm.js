const extend = Object.assign;
const EMPTY_OBJ = {};
function isObject(val) {
    return val !== null && typeof val === 'object';
}
function hasChange(newVal, val) {
    return !Object.is(newVal, val);
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

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
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
    // component + children object slots标识
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    // 区分element还是状态组件
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

// 数组不能渲染。必须转换成vnode的children
function renderSlots(slots, name, props) {
    // //如果插槽内容是数组，则将$slots看作是children(array) => vnode 数组字元素，放到vnode中渲染s
    // 具名插槽。获取对应name的插槽内容
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            // 函数时，作用域插槽。传入组件内的数据
            // Fragment: 避免对slots渲染的多余包裹
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

let activeEffect; // reactiveEffect的实例
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    // Object.assign(_effect, options)
    // extend
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect; // 挂载effect到fn上
    return runner;
}
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true; // 是否活跃的双向绑定，false则已经stop
        this.isStop = false; // todo:自己实现的暂停跟踪
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        activeEffect = this;
        return this._fn();
    }
    stop() {
        // 性能优化，避免反复去删除
        if (this.active) {
            cleanupEffect(this);
            this.onStop && this.onStop();
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.isStop = true; // 当前effect已经停止
    effect.deps.forEach((dep) => {
        // 删除当前effect
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking()) {
        return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, dep = new Set());
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect)) {
        return;
    }
    dep.add(activeEffect);
    // 反向收集所有执行Effect的dep
    activeEffect.deps.push(dep);
}
function isTracking() {
    return activeEffect && !activeEffect.isStop;
    // 如果没有effect函数,单纯的reactive,没有activeEffect
    // if (!activeEffect) { return }
    // 不能再追踪依赖
    // if (activeEffect.isStop) { return }
}
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
        // todo: first judge
        if (!isReadonly) {
            track(target, key);
        }
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

class RefImpl {
    constructor(value) {
        this.__is_Ref = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChange(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    const { __is_Ref } = ref;
    return !!__is_Ref;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key, receiver) {
            return unRef(Reflect.get(target, key, receiver));
        },
        set(target, p, value, receiver) {
            // 在原ref的value上赋值
            if (isRef(target[p]) && !isRef(value)) {
                return target[p].value = value;
            }
            else {
                // 新的ref直接赋值
                return Reflect.set(target, p, value, receiver);
            }
        },
    });
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
    $slots: i => i.slots,
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
    // slot的children是对象形式
    // !children, slots赋值
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        // value => slot
        slots[key] = props => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

// 创建组件实例，props,slots,provides,emit等初始化
function createComponentInstance(vnode, parent) {
    // eslint-disable-next-line no-console
    console.log('createComponentInstance', parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: EMPTY_OBJ,
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { },
        isMounted: false,
        subTree: {},
    };
    // 挂载到组件实例上
    // todo:通过bind，第一个参数传入的是component，用户后续传入其他参数，不需要传入第一个实例
    component.emit = emit.bind(null, component);
    return component;
}
// 组件初始化：props,slots,setup等并代理到组件实例上
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
        // !获取currentInstance前置方法：只能在setup中调用该API
        setCurrentInstance(instance);
        // todo: ?function / object
        // *传入组件的props是shallowReadonly浅只读的
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit, // 利用实例挂载emit
        });
        // !关闭获取currentInstance的后置方法：只能在setup中调用该API
        setCurrentInstance(null);
        // 将setup的数据挂载到instance.setupState上
        handleSetupResult(instance, setupResult);
    }
}
// 将setup返回的结果挂载到实例上
function handleSetupResult(instance, setupResult) {
    // function || Object
    // todo: function
    if (typeof setupResult === 'object') {
        // !如果setup的返回是一个对象，将返回结果赋值到组件实例上.
        // * 将setup返回的数据作unRef处理
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
// 结束setup处理
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
// todo:方便全局跟踪，中间层，防止变量被意外修改导致的bug
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 获取组件实例
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        // 从组件中获取provides
        let { provides } = currentInstance;
        // 组件实例初始化时，provides = parent.provides
        // provides是引用地址，如果此时直接修改，会导致覆盖父级的元素
        const parentProvides = currentInstance.parent.provides;
        // init时，当前组件的provides === parentProvides。将其存储为自己的原型
        if (provides === parentProvides) {
            // 组件中获取provides优先去父级组件获取。
            // Object.create()使用现有对象作为新创建对象的原型
            // {}.__proto__ = parentProvides
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        // 将对应的值存储起来
        provides[key] = value;
    }
}
function inject(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        // 从父组件中获取对应的provides
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (value) {
            if (typeof value === 'function') {
                return value();
            }
            return value;
        }
    }
}

// 拿到render方法
function createAppAPI(render) {
    // 将真实的render暴露出去
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先 vnode
                // !component => vnode
                // 所有的逻辑操作都会基于 vnode 处理
                const vnode = createVNode(rootComponent);
                if (typeof rootContainer === 'string') {
                    rootContainer = document.querySelector(rootContainer);
                    // !监测传入的挂载元素是否是合理的
                    if (rootContainer === null) {
                        console.warn(`The rootContainer ${rootContainer} isn't a elementNode`);
                    }
                }
                render(vnode, rootContainer);
            },
        };
    };
}

// render渲染器
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        // patch => mount/update
        patch(null, vnode, container, null);
    }
    // n1 => old
    // n2 => new
    function patch(n1, n2, container, parentComponent) {
        // todo： component || element
        const { type, shapeFlag } = n2;
        // console.log(type) // 组件是Object, element是字符串, Fragment slots
        switch (type) {
            // Fragment only render children
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    // 处理 element
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container);
        }
    }
    // 更新Element
    function patchElement(n1, n2, container) {
        console.log('patchElement', container);
        console.log(n1, n2);
        const oldProps = n1.props;
        const newProps = n2.props;
        const el = n2.el = n1.el;
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    // 挂载元素以及对应的属性
    function mountElement(vnode, container, parentComponent) {
        // type: div
        // props: attribute
        // children: string || array
        const { type, props, children, shapeFlag } = vnode;
        // * hostCreateElement
        // vnode.el = div
        // ! 从外部传入的createElement中拿到挂载的元素
        const el = vnode.el = hostCreateElement(type);
        // * setAttribute
        for (const key in props) {
            const val = props[key];
            // !事件处理
            // !将属性挂载到el上
            hostPatchProp(el, key, null, val);
        }
        // * textContent
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent);
        }
        // * appendChild
        // container.appendChild(el)
        // !利用外部的挂载方法
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounter) {
                console.log('init');
                // 得到组件对应的虚拟dom
                const { proxy } = instance; // 从实例中获取代理
                const subTree = instance.subTree = instance.render.call(proxy);
                // vnode => patch
                // initialVNode => element => mountElement
                patch(null, subTree, container, instance);
                // 所有的 element => mount
                initialVNode.el = subTree.el;
                instance.isMounter = true; // 已挂载
            }
            else {
                console.log('update');
                // 得到组件对应的虚拟dom
                const { proxy } = instance; // 从实例中获取代理
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.append(textNode);
    }
    // 封装了渲染的所有逻辑。将内部render渲染暴露出去
    return {
        createApp: createAppAPI(render), // 真实的render渲染挂载方法
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevValue, nextValue) {
    // 事件与属性的处理
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextValue);
    }
    else {
        // 删除属性操作
        if (nextValue === undefined || nextValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(el, parent) {
    parent.append(el);
}
// * 暴露 renderer.createApp 真实的createApp 渲染挂载
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
// 导出createApp方法。内部实现了renderer的createApp
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
