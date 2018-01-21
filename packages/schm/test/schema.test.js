import { decamelizeKeys } from 'humps'
import validatejs from 'validate.js'
import faker, { name, lorem } from 'faker'
import times from 'lodash/times'
import schema from '../src/schema'

test('parse', () => {
  const schm = schema({ foo: String })
  expect(schm.parse({ foo: 1 })).toEqual({ foo: '1' })
})

test('validate', async () => {
  const schm = schema({
    foo: {
      type: String,
      required: true,
    },
  })
  await expect(schm.validate()).rejects.toMatchSnapshot()
})

test('custom parse', () => {
  const customParse = previous => previous.merge({
    parse(values) {
      return decamelizeKeys(previous.parse(values))
    },
  })
  const schm = schema({ fooBar: [{ barBaz: String }] }, customParse)
  const values = {
    fooBar: [
      { barBaz: 'foo' },
      { barBaz: 'bar' },
    ],
  }
  expect(schm.parse(values)).toEqual({
    foo_bar: [
      { bar_baz: 'foo' },
      { bar_baz: 'bar' },
    ],
  })
})

test('custom validate', async () => {
  const customValidate = constraints => previous => previous.merge({
    async validate(values) {
      const parsed = previous.parse(values)
      return validatejs(parsed, constraints)
    },
  })
  const constraints = { foo: { presence: true } }
  const schm = schema({ foo: String }, customValidate(constraints))
  await expect(schm.validate()).resolves.toEqual({
    foo: ["Foo can't be blank"],
  })
})

test('custom parser', () => {
  const customParser = previous => previous.merge({
    parsers: {
      exclaim: value => `${value}!!`,
    },
  })
  const params = { foo: { type: String, exclaim: true } }
  const schm = schema(params, customParser)
  const values = { foo: 'bar' }
  expect(schm.parse(values)).toEqual({ foo: 'bar!!' })
})

test('custom validator', async () => {
  const customValidator = previous => previous.merge({
    validators: {
      exclamation: () => ({ valid: false }),
    },
  })
  const params = { foo: { type: String, exclamation: true } }
  const schm = schema(params, customValidator)
  const values = { foo: 'bar' }
  await expect(schm.validate(values)).rejects.toEqual([{
    exclamation: true,
    param: 'foo',
    validator: 'exclamation',
    value: 'bar',
  }])
})

test('custom params', () => {
  const customParams = previous => previous.merge({
    params: {
      bar: String,
    },
  })
  const schm = schema({ foo: String }, customParams)
  const values = { foo: 1, bar: 2 }
  expect(schm.parse(values)).toEqual({ foo: '1', bar: '2' })
})

describe('composition', () => {
  it('composes schema group', () => {
    const concatWithFoo = params => previous => previous.merge({
      params,
      parsers: {
        foo: (value, option) => `${value}${option}`,
      },
    })

    const concatWithDefaultValue = params => previous => previous.merge({
      params: Object.keys(params).reduce((finalParams, name) => ({
        ...finalParams,
        [name]: {
          bar: params[name],
        },
      }), {}),
      parsers: {
        bar: (value, option) => `${value}${option}`,
      },
    })

    const schm = schema({
      name: String,
    }, concatWithFoo({
      name: {
        foo: 'foo',
      },
    }), concatWithDefaultValue({
      name: 'bar',
    }))

    expect(schm.parse({ name: 'test' })).toEqual({ name: 'testfoobar' })
  })

  it('composes schema', () => {
    const schema1 = schema({ age: Number })
    const schema2 = schema(schema1, { name: String })
    expect(schema2.parse({ name: 'Haz', age: '27' })).toEqual({
      name: 'Haz',
      age: 27,
    })
  })
})

describe('nested schema', () => {
  const createPerson = () => ({ name: name.firstName(), age: 20 })
  const createStudent = () => ({ ...createPerson(), grade: 5 })
  const createTeacher = () => ({ ...createPerson(), subjects: times(3, lorem.word) })
  const createClass = () => ({
    grade: 5,
    subject: lorem.word(),
    teacher: createTeacher(),
    students: times(5, createStudent),
  })

  const personSchema = schema({
    name: String,
    age: Number,
  })
  const studentSchema = schema(personSchema, {
    grade: Number,
  })
  const teacherSchema = schema(personSchema, {
    subjects: [String],
  })

  const classSchema = schema({
    grade: Number,
    subject: String,
    teacher: teacherSchema,
    students: [studentSchema],
  })

  beforeEach(() => {
    faker.seed(123)
  })

  // console.log(classSchema.params.students.type[0].type[0].type)
  console.log('parse', classSchema.parse({ teacher: { ppq: { lol: [{ teacher: { name: 'lol' } }] } } }).teacher.ppq)

  it.only('rejects validation', async () => {
    // await expect(classSchema.validate({ students: [[{ name: 'lol' }]] })).rejects.toMatchSnapshot()
  })

  it('resolves validation', async () => {
    await expect(classSchema.validate({
      name: 'Computer Science',
      teacher: {
        name: 'Grace',
      },
    })).resolves.toMatchSnapshot()
  })

  it('parses', () => {
    expect(classSchema.parse()).toMatchSnapshot()
  })

  it('calls parse on nested schemas', () => {
    const teacher = { name: 'Grace' }
    const students = [{ name: 'foo' }, { name: 'bar' }]
    const otherStudents = [{ name: 'baz' }]
    parseMock.mockReset()
    expect(classSchema.parse({ teacher, students, otherStudents })).toMatchSnapshot()
    expect(parseMock).toHaveBeenCalledTimes(4)
    expect(parseMock).toHaveBeenCalledWith(teacher)
    expect(parseMock).toHaveBeenCalledWith(students[0])
    expect(parseMock).toHaveBeenCalledWith(students[1])
    expect(parseMock).toHaveBeenCalledWith(otherStudents[0])
  })
})
