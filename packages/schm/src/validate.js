// @flow
import mapValues from './mapValues'
import type { Schema, ValidationError } from './types'

const isPrimitive = arg =>
  arg == null || (typeof arg !== 'object' && typeof arg !== 'function')

const replaceMessage = (
  message: string,
  paramName: string,
  value: any,
  validatorName: string
): string => (
  message
    .replace(/\{(PARAM|PATH)\}/g, paramName)
    .replace(/\{VALUE\}/g, value)
    .replace(/\{(VALIDATOR|TYPE)\}/g, validatorName)
)

const createErrorObject = (
  param: string,
  value: any,
  validator: string,
  option: any,
  message?: string
): ValidationError => ({
  param,
  ...isPrimitive(value) ? { value } : {},
  validator,
  ...isPrimitive(option) ? { [validator]: option } : {},
  ...message ? { message: replaceMessage(message, param, value, validator) } : {},
})

/**
 * Validates a schema based on given values.
 * @example
 * const userSchema = schema({
 *   name: {
 *     type: String,
 *     required: true,
 *   },
 *   age: {
 *     type: Number,
 *     min: [18, 'Too young'],
 *   }
 * })
 *
 * validate({ name: 'John', age: 17 }, userSchema)
 *   .then((parsedValues) => {
 *     console.log('Yaay!', parsedValues)
 *   })
 *   .catch((errors) => {
 *     console.log('Oops!', errors)
 *   })
 *
 * \/*
 * Output:
 * Oops! [{
 *   param: 'age',
 *   value: 17,
 *   validator: 'min',
 *   min: 18,
 *   message: 'Too young',
 * }]
 * *\/
 */
const validate = (values?: Object = {}, schema: Schema): Promise<ValidationError[]> => {
  const parsed = schema.parse(values)
  const promises = []
  const errors = []

  mapValues(parsed, schema.params, (value, options, paramName, paramPath) => {
    let error

    Object.keys(options).forEach((optionName) => {
      if (error) return

      const option = options[optionName]
      const validator = schema.validators[optionName]

      if (typeof validator === 'function') {
        const result = validator(value, option, parsed, options, schema.params)
        const { valid, message, isSchema } = result

        if (!valid) {
          error = createErrorObject(paramPath, value, optionName, option, message)
          errors.push(error)
        } else if (typeof valid.catch === 'function') {
          promises.push(valid.catch((schemaErrors) => {
            if (isSchema) {
              return errors.push(...schemaErrors)
            }
            const errorObject = createErrorObject(paramPath, valid, optionName, option, message)
            return Promise.reject(errorObject)
          }))
        }
      } else if (validator) {
        throw new Error(`[schm] ${paramName} validator must be a function`)
      }
    })
  })

  return Promise.all(promises).then(() => {
    if (errors.length) {
      return Promise.reject(errors)
    }
    return parsed
  }, (e) => {
    const allErrors = [].concat(errors, e)
    return Promise.reject(allErrors)
  })
}

export default validate
