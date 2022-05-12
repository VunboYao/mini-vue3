export const extend = Object.assign

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getType(val) {
  const type = typeof val
  if (type !== 'object') {
    return type
  }
  return Object.prototype.toString.call(val).replace(/^\[object (\S+)]$/, (match, target: string) => {
    return target.toLowerCase()
  })
}

export function isObject(val: any) {
  return val !== null && typeof val === 'object'
}

export function hasChange(newVal, val) {
  return !Object.is(newVal, val)
}

export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)
