import parseParams from '../src/parseParams'

it('parses literal type', () => {
  expect(parseParams({ foo: String }))
    .toEqual({ foo: { type: String } })
})

it('parses array literal type', () => {
  expect(parseParams({ foo: [String] }))
    .toEqual({ foo: { type: [{ type: String }] } })
})

it('parses type', () => {
  expect(parseParams({ foo: { type: String } }))
    .toEqual({ foo: { type: String } })
})

it('parses array type', () => {
  expect(parseParams({ foo: [{ type: String }] }))
    .toEqual({ foo: { type: [{ type: String }] } })
})

it('parses default value', () => {
  expect(parseParams({ foo: 'bar' }))
    .toEqual({ foo: { type: String, default: 'bar' } })
})

it('parses array default value', () => {
  expect(parseParams({ foo: ['bar'] }))
    .toEqual({ foo: { type: [{ type: String, default: 'bar' }] } })
})

it('parses nested object', () => {
  expect(parseParams({ foo: { bar: String } })).toMatchSnapshot()
})

it('parses array nested object', () => {
  expect(parseParams({ foo: [{ bar: String }] })).toMatchSnapshot()
})
