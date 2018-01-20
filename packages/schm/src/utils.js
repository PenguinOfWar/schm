// @flow
import type { Schema } from './types'

type TransformValueFunction = (
  value: any,
  options: Object,
  paramName: string,
  paramPath: string,
) => any

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

export const mapValuesToSchema = (
  values: Object = {},
  schema: Schema,
  transformValue: TransformValueFunction,
  paramNames: string[] = [],
): Object => (
  Object.keys(schema.params).reduce((finalParams, paramName) => {
    const options = schema.params[paramName]
    const value = values[paramName]
    let finalValue

    if (isSchema(options.type)) {
      finalValue = value ? mapValuesToSchema(
        value,
        options.type,
        transformValue,
        [...paramNames, paramName],
      ) : undefined
    } else if (Array.isArray(options.type)) {
      const arrayValue = toArray(value)

      if (isSchema(options.type[0].type)) {
        finalValue = arrayValue.map((val, i) => mapValuesToSchema(
          val,
          options.type[0].type,
          transformValue,
          [...paramNames, paramName, `${i}`]
        ))

      // RECURSIVE
      // RECURSIVE
      // RECURSIVE
      // RECURSIVE
      // RECURSIVE
      // RECURSIVE
      } else if (Array.isArray(options.type[0].type)) {
        const arrayValue = toArray((value || [])[0])

        if (isSchema(options.type[0].type[0])) {
          finalValue = arrayValue.map((val, i) => mapValuesToSchema(
            val,
            options.type[0].type[0].type,
            transformValue,
            [...paramNames, paramName, `${i}`]
          ))
        } else {
          finalValue = arrayValue.map((val, i) => transformValue(
            val,
            options.type[0].type[0],
            paramName,
            [...paramNames, paramName, i].join('.')
          ))
        }
      } else {
        finalValue = arrayValue.map((val, i) => transformValue(
          val,
          options.type[0],
          paramName,
          [...paramNames, paramName, i].join('.')
        ))
      }
    } else {
      finalValue = transformValue(
        value,
        options,
        paramName,
        [...paramNames, paramName].join('.')
      )
    }

    return {
      ...finalParams,
      [paramName]: finalValue,
    }
  }, {})
)
