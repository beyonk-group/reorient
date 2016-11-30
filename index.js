'use strict'

const { transform } = require('hoek')

class Internals {
  transform (source, transforms, options) {
    const transformed = transform(source, transforms, options)

    return options.trim ? this.trim(transformed) : transformed
  }

  isDefined (value) {
    return ![null, undefined, void 0].includes(value)
  }

  hasChildren (value) {
    return Object.keys(value).length === 0
  }

  isNested (value) {
    return typeof value === 'object'
  }

  trim (transformed) {
    return Object.keys(transformed).reduce((result, key) => {
      let value = transformed[key]
      if (this.isDefined(value) && this.hasChildren(value)) {
        result[key] = this.isNested(value) ? this.trim(value) : value
      }
      return result
    }, {})
  }
}

const internals = new Internals()

class Transformer {
  transform (source, transforms, options = {}) {
    const allKeys = Object.keys(transforms)
    const newSource = { mappings: source, methodized: {} }
    const newTransforms = {}

    allKeys.forEach((key, i) => {
      if (typeof transforms[key] === 'string') {
        newTransforms[key] = `mappings.${transforms[key]}`
      } else {
        const id = `_key${i}`
        const value = transforms[key].call(transforms[key], source)

        newSource.methodized[id] = value
        newTransforms[key] = `methodized.${id}`
      }
    })

    return internals.transform(newSource, newTransforms, options)
  }
}

module.exports = new Transformer()