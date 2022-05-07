import { isReadonly, readonly } from '../reactive'

describe('readonly', () => {
  test('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(original)
    expect(wrapped).not.toBe(original)
    expect(wrapped.foo).toBe(1)
    expect(isReadonly(wrapped.bar)).toBe(true)
    expect(isReadonly(original.bar.baz)).toBe(false)
  })

  test('is_readonly', () => {
    const original = { foo: 1 }
    const wrapped = readonly(original)
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(original)).toBe(false)
  })

  test('warning when set func was called', () => {
    console.warn = jest.fn()
    const user = readonly({
      age: 10,
    })
    user.age = 11
    expect(console.warn).toBeCalledTimes(1)
  })
})
