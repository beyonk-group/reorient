'use strict'

const { assert, reach } = require('@hapi/hoek')
const { transform } = require('./transform')

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

async function doTransform (id, source, configuration) {
  assert(
    configuration.hasOwnProperty('path'),
    'Transform options should at least include `path` property.'
  )

  if (configuration.hasOwnProperty('default')) {
    assert(typeof configuration.path === 'string',
      'Transformations with default values cannot be functions'
    )
  }

  if (configuration.hasOwnProperty('validate')) {
    assert(
      typeof configuration.validate === 'function',
      'validate property should be a function which returns true or throws an error'
    )
  }

  const { path } = configuration
  const transformed = typeof path === 'function'
    ? await path.call(path, source)
    : reach(source, path, configuration.default ? { default: configuration.default } : undefined)

  const value = configuration.validate ? configuration.validate(transformed, source) : transformed

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

exports.transform = async function (source, transforms, options = {}) {
  const arrayOutput = Array.isArray(transforms)

  const allKeys = Object.keys(transforms)
  const newSource = { mappings: source, methodized: {} }
  const newTransforms = {}

  await Promise.all(allKeys.map(async (key, i) => {
    const destinationKey = arrayOutput ? i : key

    if (!transforms[key]) {
      transforms[key] = noop
    }

    if (typeof transforms[key] === 'string') {
      newTransforms[destinationKey] = `mappings.${transforms[key]}`
      return
    }

    const id = `_key${i}`
    const transformConfiguration = typeof transforms[key] === 'object' ? transforms[key] : { path: transforms[key] }
    const { value, destination } = await doTransform(id, source, transformConfiguration)

    newSource.methodized[id] = value
    newTransforms[destinationKey] = destination
  }))

  const transformed = convert(newSource, newTransforms, options)
  return arrayOutput ? makeArray(transformed) : transformed
}
