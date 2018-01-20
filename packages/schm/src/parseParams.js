import { isSchema } from './utils'
import { defaultSchema } from './schema'

const isFunction = options => typeof options === 'function'
const isObject = options => typeof options === 'object'
const hasType = options => isObject(options) && options.type

const literalType = (options) => {
  if (isFunction(options) || isSchema(options)) {
    return { type: options }
  }
  return options
}

const defaultValue = (options) => {
  if (!isObject(options) && !isFunction(options)) {
    return { type: options.constructor, default: options }
  }
  return options
}

const nestedObject = (options) => {
  if (!isSchema(options) && isObject(options) && !hasType(options)) {
    return { type: defaultSchema(options) }
  }
  return options
}

const parseOptions = (options) => {
  if (Array.isArray(options)) {
    return { type: [parseOptions(options[0])] }
  }
  if (hasType(options) && Array.isArray(options.type)) {
    return { type: [parseOptions(options.type[0])] }
  }

  const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))
  const flow = compose(literalType, defaultValue, nestedObject)
  return flow(options)
}

const parseParams = params => (
  Object.keys(params).reduce((finalParams, paramName) => ({
    ...finalParams,
    [paramName]: parseOptions(params[paramName]),
  }), {})
)

export default parseParams
