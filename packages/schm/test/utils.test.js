import schema from '../src'
import { isSchema, mapValuesToSchema } from '../src/utils'

test('isSchema', () => {
  expect(isSchema({})).toBe(false)
  expect(isSchema(schema())).toBe(true)
})

test.only('mapValuesToSchema', () => {
  const schm = schema({
    foo: String,
    bar: {
      baz: [{
        qux: [{
          type: String,
        }],
      }],
    },
  })
  const values = {
    foo: 'foo',
    bar: {
      baz: [
        { qux: ['1', '2'] },
        { qux: '3' },
      ],
    },
  }
  const fn = jest.fn((value, options, paramName, paramPath) => ({
    paramName,
    options,
    value,
    paramPath,
  }))
  expect(mapValuesToSchema(values, schm, fn)).toMatchSnapshot()
})
