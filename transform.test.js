'use strict'

const { transform } = require('./transform')
const { expect } = require('@hapi/code')

describe('transform()', () => {
  const source = {
    address: {
      one: '123 main street',
      two: 'PO Box 1234'
    },
    zip: {
      code: 3321232,
      province: null
    },
    title: 'Warehouse',
    state: 'CA'
  }
  const sourcesArray = [{
    address: {
      one: '123 main street',
      two: 'PO Box 1234'
    },
    zip: {
      code: 3321232,
      province: null
    },
    title: 'Warehouse',
    state: 'CA'
  }, {
    address: {
      one: '456 market street',
      two: 'PO Box 5678'
    },
    zip: {
      code: 9876,
      province: null
    },
    title: 'Garage',
    state: 'NY'
  }]
  it('transforms an object based on the input object', () => {
    const result = transform(source, {
      'person.address.lineOne': 'address.one',
      'person.address.lineTwo': 'address.two',
      'title': 'title',
      'person.address.region': 'state',
      'person.address.zip': 'zip.code',
      'person.address.location': 'zip.province'
    })
    expect(result).to.equal({
      person: {
        address: {
          lineOne: '123 main street',
          lineTwo: 'PO Box 1234',
          region: 'CA',
          zip: 3321232,
          location: null
        }
      },
      title: 'Warehouse'
    })
  })
  it('transforms an array of objects based on the input object', () => {
    const result = transform(sourcesArray, {
      'person.address.lineOne': 'address.one',
      'person.address.lineTwo': 'address.two',
      'title': 'title',
      'person.address.region': 'state',
      'person.address.zip': 'zip.code',
      'person.address.location': 'zip.province'
    })
    expect(result).to.equal([
      {
        person: {
          address: {
            lineOne: '123 main street',
            lineTwo: 'PO Box 1234',
            region: 'CA',
            zip: 3321232,
            location: null
          }
        },
        title: 'Warehouse'
      },
      {
        person: {
          address: {
            lineOne: '456 market street',
            lineTwo: 'PO Box 5678',
            region: 'NY',
            zip: 9876,
            location: null
          }
        },
        title: 'Garage'
      }
    ])
  })
  it('uses the reach options passed into it', () => {
    const schema = {
      'person-address-lineOne': 'address-one',
      'person-address-lineTwo': 'address-two',
      'title': 'title',
      'person-address-region': 'state',
      'person-prefix': 'person-title',
      'person-zip': 'zip-code'
    }
    const options = {
      separator: '-',
      default: 'unknown'
    }
    const result = transform(source, schema, options)
    expect(result).to.equal({
      person: {
        address: {
          lineOne: '123 main street',
          lineTwo: 'PO Box 1234',
          region: 'CA'
        },
        prefix: 'unknown',
        zip: 3321232
      },
      title: 'Warehouse'
    })
  })
  it('uses a default separator for keys if options does not specify on', () => {
    const schema = {
      'person.address.lineOne': 'address.one',
      'person.address.lineTwo': 'address.two',
      'title': 'title',
      'person.address.region': 'state',
      'person.prefix': 'person.title',
      'person.zip': 'zip.code'
    }
    const options = {
      default: 'unknown'
    }
    const result = transform(source, schema, options)
    expect(result).to.equal({
      person: {
        address: {
          lineOne: '123 main street',
          lineTwo: 'PO Box 1234',
          region: 'CA'
        },
        prefix: 'unknown',
        zip: 3321232
      },
      title: 'Warehouse'
    })
  })
  it('works to create shallow objects', () => {
    const result = transform(source, {
      lineOne: 'address.one',
      lineTwo: 'address.two',
      title: 'title',
      region: 'state',
      province: 'zip.province'
    })
    expect(result).to.equal({
      lineOne: '123 main street',
      lineTwo: 'PO Box 1234',
      title: 'Warehouse',
      region: 'CA',
      province: null
    })
  })
  it('only allows strings in the map', () => {
    expect(() => {
      transform(source, {
        lineOne: {}
      })
    }).to.throw('All mappings must be "." delineated strings')
  })
  it('throws an error on invalid arguments', () => {
    expect(() => {
      transform(NaN, {})
    }).to.throw('Invalid source object: must be null, undefined, an object, or an array')
  })
  it('is safe to pass null', () => {
    const result = transform(null, {})
    expect(result).to.equal({})
  })
  it('is safe to pass undefined', () => {
    const result = transform(undefined, {})
    expect(result).to.equal({})
  })
})
