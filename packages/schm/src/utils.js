// @flow
import type { Schema } from './types'

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
