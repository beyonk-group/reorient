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

    function getSomeValue () {
      return 'xyzzy'
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
      'fred.plugh': 'garply.waldo',
      'thud': getSomeValue
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

    it('Maps regular values', () => {
      expect(result.thud).to.equal(getSomeValue())
    })

    it('Does not trim nulls by default', () => {
      const transformed = transform(source, transforms)
      expect(transformed).to.include(['foo', 'bar', 'baz', 'qux', 'grault'])
    })
  })

  context('Defaults', () => {
    const source = {
      foo: 'foo',
      bar: 'bar',
      baz: undefined,
      qux: null,
      grault: false,
      plugh: 0,
      thud: ''
    }

    const transforms = {
      foo: 'foo',
      bar: { path: 'bar', default: 'barr' },
      baz: { path: 'baz', default: 'quux' },
      qux: { path: 'qux', default: 'garply' },
      grault: { path: 'grault', default: 'waldo' },
      plugh: { path: 'plugh', default: 'thud' },
      thud: { path: 'thud', default: 'zap' },
      kwak: { path: 'kwak', default: 'blorp' },
      wack: { path: 'wack.porp', default: 'doop' }
    }

    let result

    before(() => {
      result = transform(source, transforms)
    })

    it('Regular transform', () => {
      expect(result.foo).to.equal(source.foo)
    })

    it('Regular transform with default', () => {
      expect(result.bar).to.equal(source.bar)
    })

    it('Does not default undefined property', () => {
      expect(result.baz).to.equal(undefined)
    })

    it('Does not default null property', () => {
      expect(result.qux).to.equal(null)
    })

    it('Does not default falsy property', () => {
      expect(result.grault).to.equal(false)
    })

    it('Does not default falsy value 0', () => {
      expect(result.plugh).to.equal(0)
    })

    it('Does not default falsy value <empty string>', () => {
      expect(result.thud).to.equal('')
    })

    it('Defaults missing property', () => {
      expect(result.kwak).to.equal('blorp')
    })

    it('Defaults missing path', () => {
      expect(result.wack).to.equal('doop')
    })
  })
})
