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
    return this.isObject(value) && Object.keys(value).length > 0
  }

  isObject (value) {
    return this.isDefined(value) && typeof value === 'object'
  }

  trim (transformed) {
    const res = Object.keys(transformed).reduce((result, key) => {
      let value = transformed[key]

      if (this.hasChildren(value)) {
        value = this.trim(value)
      }

      if (this.isDefined(value)) {
        result[key] = value
      }

      return result
    }, {})
    return this.hasChildren(res) ? res : null
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