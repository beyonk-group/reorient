'use strict'

const { transform } = require('hoek')

class Transformer {
  transform (source, transforms, options) {
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

    

    return transform(newSource, newTransforms, options)
  }
}

module.exports = new Transformer()