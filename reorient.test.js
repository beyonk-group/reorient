'use strict'

const { transform } = require('.')
const { expect } = require('code')

describe('Reorient', () => {
  context('#transform()', () => {
    const CORGE = 'corge'
    const getCorge = function () { return CORGE }
    const combineGarplyFred = function (source) { return `${source.garply} & ${source.fred}`}
    let result

    const source = {
      foo: 'bar',
      garply: 'waldo',
      fred: 'plugh'
    }

    const transforms = {
      'baz': 'foo',
      'qux': getCorge,
      'grault': combineGarplyFred
    }

    before(() => {
      result = transform(source, transforms)
    })

    it('Transforms values', () => {
      expect(result.baz).to.equal(source.foo)
    })

    it('Transforms functions', () => {
      expect(result.qux).to.equal(CORGE)
    })

    it('Transformation function receives source', () => {
      expect(result.grault).to.equal('waldo & plugh')
    })
  })
})
