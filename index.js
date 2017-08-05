'use strict'

const { transform, assert, reach } = require('hoek')

function convert (source, transforms, options) {
  const transformed = transform(source, transforms, options)

  return options.trim ? trim(transformed) : transformed
}

function isDefined (value) {
  return ![null, undefined, void 0].includes(value)
}

function hasChildren (value) {
  return isObject(value) && Object.keys(value).length > 0
}

function isObject (value) {
  return isDefined(value) && typeof value === 'object'
}

function trim (transformed) {
  const res = Object.keys(transformed).reduce((result, key) => {
    let value = transformed[key]

    if (hasChildren(value)) {
      value = trim(value)
    }

    if (isDefined(value)) {
      result[key] = value
    }

    return result
  }, {})

  return hasChildren(res) ? res : null
}

function transformFromConfiguration (id, source, configuration) {
  assert(
    configuration.hasOwnProperty('path') 
    && configuration.hasOwnProperty('default'),
    'Defaultable values should have `path` and `default` properties'
  )
  
  assert(typeof configuration.path === 'string',
    'Transformations with default values cannot be functions'
  )

  const value = reach(source, configuration.path, { default: configuration.default })

  return { value, destination: `methodized.${id}` }
}

function transformFromFunction (id, source, fn) {
  const value = fn.call(fn, source)
  
  return { value, destination: `methodized.${id}` }
}

function makeArray (indexed) {
  return Array.from(
    Object.keys(indexed), i => indexed[i]
  )
}

function noop () {
  return null
}

exports.transform = function (source, transforms, options = {}) {
  const arrayOutput = Array.isArray(transforms)

  const allKeys = Object.keys(transforms)
  const newSource = { mappings: source, methodized: {} }
  const newTransforms = {}

  allKeys.forEach((key, i) => {
    const destinationKey = arrayOutput ? i : key
    
    if (!transforms[key]) {
      transforms[key] = noop
    }

    if (typeof transforms[key] === 'string') {
      newTransforms[destinationKey] = `mappings.${transforms[key]}`
      return
    }

    const id = `_key${i}`
    const keyIsObject = typeof transforms[key] === 'object'
    const { value, destination } = keyIsObject ? 
      transformFromConfiguration(id, source, transforms[key]) :
      transformFromFunction(id, source, transforms[key])

    newSource.methodized[id] = value
    newTransforms[destinationKey] = destination
  })

  const transformed = convert(newSource, newTransforms, options)
  return arrayOutput ? makeArray(transformed) : transformed
}
