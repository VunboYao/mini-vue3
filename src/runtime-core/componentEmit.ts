import { camelCase, toHandlerKey } from '../shared'

export function emit(instance, event, ...args) {
  // instance.props => event
  const { props } = instance
  // TPP
  // 先去写一个特定的行为 => 重构成通用的行为
  /*
  const handler = props.onAdd
  handler && handler()
  */

  const handleName = toHandlerKey(camelCase(event))
  const handler = props[handleName]
  handler && handler(...args) // 参数处理
}
