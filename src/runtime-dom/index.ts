import { createRenderer } from '../runtime-core'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, prevValue, nextValue) {
  // 事件与属性的处理
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextValue)
  } else {
    // 删除属性操作
    if (nextValue === undefined || nextValue === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextValue)
    }
  }
}

function insert(el, parent) {
  parent.append(el)
}

function remove(child) {
  const parent = child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}

function setElementText(el, text) {
  el.textContent = text
}

// * 暴露 renderer.createApp 真实的createApp 渲染挂载
const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
})

// 导出createApp方法。内部实现了renderer的createApp
export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
