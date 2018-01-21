// @flow
import type { Schema } from './types'
import omit from 'lodash/omit'

export const toArray = (value: any): any[] => (
  [].concat(typeof value === 'undefined' ? [] : value)
)

export const isSchema = (schema: ?Schema): boolean => !!(
  schema &&
  schema.params &&
  schema.parsers &&
  schema.validators &&
  schema.parse &&
  schema.validate &&
  schema.merge
)

export const isFunction = (value: any): boolean => (
  typeof value === 'function'
)

export const isObject = (value: any): boolean => (
  typeof value === 'object'
)

type ParsedOption = {
  optionValue: any,
  message?: string,
}

export const parseValidatorOption = (option: any, ignoreArray?: boolean): ParsedOption => {
  const isArrayAndHasMessage = (v: any): boolean => (
    Array.isArray(v) &&
    v.length === 2 &&
    typeof v[1] === 'string'
  )
  const isValidatorObject = (v: any): boolean => v && (v.message || v.msg)

  if (!ignoreArray && isArrayAndHasMessage(option)) {
    return {
      optionValue: option[0],
      message: option[1],
    }
  } else if (isValidatorObject(option)) {
    const optionWithoutMessage = omit(option, 'message', 'msg')
    const optionValueKey = Object.keys(optionWithoutMessage)[0]
    return {
      optionValue: optionWithoutMessage[optionValueKey],
      message: option.message || option.msg,
    }
  }
  return { optionValue: option }
}
