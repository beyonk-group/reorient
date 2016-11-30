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

  context('Trim nulls', () => {
    let result

    function makeUndefined () {
      return undefined
    }

    const source = {
      bar: undefined,
      baz: void 0,
      qux: null,
      grault: false,
      garply: {
        waldo: undefined
      }
    }

    const transforms = {
      'foo': makeUndefined,
      'bar': 'bar',
      'baz': 'baz',
      'qux': 'qux',
      'grault': 'grault',
      'fred.plugh': 'garply.waldo'
    }

    before(() => {
      result = transform(source, transforms, { trim: true })
    })

    it('Strips undefined resolved values', () => {
      expect(result).not.to.include('foo')
    })

    it('Strips undefined values', () => {
      expect(result).not.to.include('bar')
    })

    it('Strips void 0 values', () => {
      expect(result).not.to.include('baz')
    })

    it('Strips null values', () => {
      expect(result).not.to.include('qux')
    })

    it('Strips nested undefined values', () => {
      expect(result).not.to.include('fred')
    })

    it('Does not strip false values', () => {
      expect(result).to.include('grault')
    })

    it('Does not trim nulls by default', () => {
      const transformed = transform(source, transforms)
      expect(transformed).to.include(['foo', 'bar', 'baz', 'qux', 'grault'])
    })
  })
})
