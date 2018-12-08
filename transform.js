'use strict'

const { assert, reach } = require('hoek')

exports.transform = function (source, transform, options) {
  assert(source === null || source === undefined || typeof source === 'object' || Array.isArray(source), 'Invalid source object: must be null, undefined, an object, or an array')
  const separator = (typeof options === 'object' && options !== null) ? (options.separator || '.') : '.'
  if (Array.isArray(source)) {
    const results = []
    for (let i = 0; i < source.length; ++i) {
      results.push(exports.transform(source[i], transform, options))
    }
    return results
  }
  const result = {}
  const keys = Object.keys(transform)
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i]
    const path = key.split(separator)
    const sourcePath = transform[key]
    assert(typeof sourcePath === 'string', 'All mappings must be "." delineated strings')
    let segment
    let res = result
    while (path.length > 1) {
      segment = path.shift()
      if (!res[segment]) {
        res[segment] = {}
      }
      res = res[segment]
    }
    segment = path.shift()
    res[segment] = reach(source, sourcePath, options)
  }
  return result
}
