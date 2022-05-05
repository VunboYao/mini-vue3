import { effect } from '../effect'
import { reactive } from '../reactive'

describe('effect', () => {
  test('happy path', () => {
    const user = reactive({
      age: 10,
    })
    let nextage
    effect(() => {
      nextage = user.age + 1
    })
    expect(nextage).toBe(11)
    user.age++
    expect(nextage).toBe(12)
  })

  test('should return runner when call effect', () => {
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  test('scheduler', () => {
    let dummy
    let run: any
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const scheduler = jest.fn(() => run = runner)
    const obj = reactive({ foo: 1 })
    const runner = effect(() => {
      dummy = obj.foo
    }, {
      scheduler,
    })
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })
})
