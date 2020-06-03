'use strict'

const { transform } = require('.')
const { expect } = require('@hapi/code')
const { stub } = require('sinon')

describe('Reorient', () => {
  context('#transform([Object object])', () => {
    const CORGE = 'corge'
    const getCorge = function () { return CORGE }
    const combineGarplyFred = function (source) { return `${source.garply} & ${source.fred}` }
    let result

    const source = {
      foo: 'bar',
      garply: 'waldo',
      fred: 'plugh'
    }

    const transforms = {
      baz: 'foo',
      qux: getCorge,
      grault: combineGarplyFred,
      corge: null
    }

    before(async () => {
      result = await transform(source, transforms)
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

    it('Supports no-op keys', () => {
      expect(result.corge).not.to.exist()
    })
  })

  context('#transform([Array array])', () => {
    const CORGE = 'corge'
    const getCorge = function () { return CORGE }
    const combineGarplyFred = function (source) { return `${source.garply} & ${source.fred}` }
    let result

    const source = {
      foo: 'bar',
      garply: 'waldo',
      fred: 'plugh',
      qux: null,
      quux: undefined,
      quz: false,
      grault: {
        waldo: 'corge'
      }
    }

    const transforms = [
      'foo',
      getCorge,
      combineGarplyFred,
      'qux',
      'quux',
      'quz',
      'grault.waldo',
      'grault.corge',
      'waldo',
      null
    ]

    before(async () => {
      result = await transform(source, transforms)
    })

    it('Result is an array', () => {
      expect(result).to.be.an.array()
    })

    it('Transforms values', () => {
      expect(result[0]).to.equal(source.foo)
    })

    it('Transforms functions', () => {
      expect(result[1]).to.equal(CORGE)
    })

    it('Transformation function receives source', () => {
      expect(result[2]).to.equal('waldo & plugh')
    })

    it('Transforms null', () => {
      expect(result[2]).to.equal('waldo & plugh')
    })

    it('Transforms undefined', () => {
      expect(result[3]).to.equal(null)
    })

    it('Transforms undefined', () => {
      expect(result[4]).to.equal(undefined)
    })

    it('Transforms false', () => {
      expect(result[5]).to.equal(false)
    })

    it('Transforms nested value', () => {
      expect(result[6]).to.equal('corge')
    })

    it('Transforms missing nested value', () => {
      expect(result[7]).to.equal(undefined)
    })

    it('Transforms missing root value', () => {
      expect(result[8]).to.equal(undefined)
    })

    it('Supports nulls as no-op', () => {
      expect(result[9]).not.to.exist()
    })
  })

  context('Nulls are trimmed', () => {
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

    before(async () => {
      result = await transform(source, transforms, { trim: true })
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

    it('Does not trim nulls by default', async () => {
      const transformed = await transform(source, transforms)
      expect(transformed).to.include(['foo', 'bar', 'baz', 'qux', 'grault'])
    })
  })

  context('With defaults', () => {
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

    before(async () => {
      result = await transform(source, transforms)
    })

    it('Regular transform', () => {
      expect(result.foo).to.equal(source.foo)
    })

    it('Regular transform with default', () => {
      expect(result.bar).to.equal(source.bar)
    })

    it('Defaults undefined property', () => {
      expect(result.baz).to.equal('quux')
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

  context('With validation', () => {
    function getQux () {
      return 'qux'
    }

    function validateIsQux () {
      return 'qux'
    }

    const source = {
      foo: 'qux',
      bar: null
    }

    const transforms = {
      foo: { path: 'foo', validate: validateIsQux },
      bar: { path: 'baz', default: 'qux', validate: validateIsQux },
      baz: { path: getQux, validate: validateIsQux }
    }

    let result

    before(async () => {
      result = await transform(source, transforms)
    })

    it('Regular transform', () => {
      expect(result.foo).to.equal(source.foo)
    })

    it('With default value', () => {
      expect(result.bar).to.equal('qux')
    })

    it('With function as path', () => {
      expect(result.baz).to.equal('qux')
    })
  })

  context('receives value and source object', () => {
    const source = {
      foo: 'qux',
      bar: 'baz'
    }

    let validateStub

    before(async () => {
      validateStub = stub()
      await transform(source, {
        baz: {
          path: 'foo',
          validate: validateStub
        }
      })
    })

    it('Recieved transformed value', () => {
      expect(validateStub.firstCall.args[0]).to.equal('qux')
    })

    it('Recieved full source', () => {
      expect(validateStub.firstCall.args[1]).to.equal(source)
    })
  })

  context('With failing', () => {
    const scenarios = [
      { scenario: 'validation of regular path', conf: { foo: { path: 'foo', validate: validateIsQux } }  },
      { scenario: 'validation of defaulted path', conf: { foo: { path: 'baz', default: 'qux', validate: validateIsQux } } },
      { scenario: 'validation of function path', conf: { foo: { path: getQux, validate: validateIsQux } } }
    ]

    function getQux () {
      return 'qux'
    }

    function validateIsQux () {
      throw new Error('validation failed')
    }

    const source = {
      foo: 'qux'
    }

    scenarios.forEach(({ scenario, conf }) => {
      it(scenario, async () => {
        await expect(
          transform(source, conf)
        ).to.reject(Error, 'validation failed')
      })
    })
  })
})

describe('Configuration', () => {
  const scenarios = [
    { scenario: 'requires path', conf: { foo: {} }, err: 'Transform options should at least include `path` property.' },
    { scenario: 'default cannot use function', conf: { foo: { path: () => {}, default: 'barr' } }, err: 'Transformations with default values cannot be functions' },
    { scenario: 'default cannot use function', conf: { foo: { path: 'x', validate: 'ff' } }, err: 'validate property should be a function which returns true or throws an error' },
  ]

  scenarios.forEach(({ scenario, conf, err }) => {
    context(scenario, () => {
      const source = {
        foo: 'foo'
      }

      it('fails validation', async () => {
        await expect(
          transform(source, conf)
        ).to.reject(
          Error,
          err
        )
      })
    })
  })
})
