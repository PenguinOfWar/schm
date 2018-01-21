// @flow

export type Parser = (
  value: any,
  option: any,
  options?: Object,
  values?: Object,
  params?: Object,
) => any

export type ValidatorResponse = {
  valid: any,
  message?: string,
  isSchema?: boolean,
}

export type Validator = (
  value: any,
  option: any,
  options?: Object,
  values?: Object,
  params?: Object,
) => ValidatorResponse

/** */
export type ValidationError = {
  param: string,
  value?: any,
  validator: string,
  message?: string,
}

/** */
export type Schema = {
  params: Object,
  parsers: { [string]: Parser },
  validators: { [string]: Validator },
  parse: (values: Object) => Object,
  validate: (values: Object) => Promise<ValidationError[]>,
  merge: (...schemas: Schema[]) => Schema,
}

/** */
export type SchemaGroup = (previous: Schema) => Schema
