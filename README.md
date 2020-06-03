<p align="center">
  <img width="186" height="90" src="https://user-images.githubusercontent.com/218949/44782765-377e7c80-ab80-11e8-9dd8-fce0e37c235b.png" alt="Beyonk" />
</p>

## Reorient

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) ![publish](https://github.com/beyonk-adventures/reorient/workflows/publish/badge.svg)

Transforms an object from one form into another form much like (the now removed) [Hoek.transform](https://github.com/hapijs/hoek/blob/5.0.4/API.md#transformobj-transform-options), but allows methods as transformation values, which are called during transformation, and passed the original source object.

This allows for more useful transformations as shown in Usage.

## Releases

### v4.0.0

* Adds validation as an option
* Defaults `undefined` values

### v3.0.0

Version 3.0.0 includes some major changes:
* We now require `await transform()` rather than `transform()`
* We took `transform` and its associated tests from `hoek`  and embedded it in the project, since it has been removed from their latest release.
* Requires node 7 or above, For node < 6, use version < 3

### < v2.1.0

Version < 2.1.0 does not use async/await

## Documentation

See Hoek.transform docs (linked above) for basic usage, see below for advanced usage.

## Usage

Transformation from object to object

```javascript
    const { transform } = require('reorient')

    const source = {
      firstName: 'Antony',
      lastName: 'Jones',
      job: {
        role: 'Developer'
       }
    }
    
    const buildFullName = function (data) {
      return data.firstName + ' ' + data.lastName
    }

    const transforms = {
      'fullName': buildFullName,
      'job.title': 'job.role'
    }

    const result = await transform(source, transforms)
    
    // results in:
    
    result === {
      fullName: 'Antony Jones',
      job: {
        title: 'Developer'
      }
    }
```

Transformation from object to array

```javascript
    const { transform } = require('reorient')

    const source = {
      firstName: 'Antony',
      lastName: 'Jones',
      job: {
        role: 'Developer'
       }
    }
    
    const buildFullName = function (data) {
      return data.firstName + ' ' + data.lastName
    }

    // to convert to an array, drop your 'destination' keys,
    // and just pass an array of transformations
    const transforms = [
      buildFullName,
      'job.role'
    ]

    const result = await transform(source, transforms)
    
    // results in:
    
    result === [
      'Antony Jones',
      'Developer'
    ]
```

### Empty mappings

If you leave a mapping directive empty, it will simply map to null. This is probably more useful for arrays where you need a gap in an array, but it works on objects too, i.e. `someKey: null`

```javascript
    const { transform } = require('reorient')

    const source = {
      one: 'one',
      two: 'not-supplied',
      three: 'three' 
    }

    const transforms = [
      'one',
      null,
      'three'
    ]

    const result = await transform(source, transforms)
    
    // results in:
    
    result === [
      'one',
      null,
      'three'
    ]
```

### options

reorient takes all the options hoek can take for
 [Hoek.transform](https://github.com/hapijs/hoek/blob/master/API.md#transformobj-transform-options), 
 and in addition, has a few extra options:

#### trim

Trim trims all null, undefined, and void values (excluding false), as well as dropping empty objects.

It will do this for all values including nested values (deep)

```javascript
    const { transform } = require('reorient')

    const source = {
      firstName: 'Antony',
      lastName: null,
      job: {
        role: undefined
       }
    }

    const transforms = {
      'firstName': 'firstName',
      'job.role': 'job.role'
    }

    const result = await transform(source, transforms, { trim: true })

    // results in:
    
    result === {
      firstName: 'Antony'
    }
```

#### default

Defaulting of properties can be done on a per property basis by specifying a configuration object than simply a path.

Defaults cannot be specified when using a function as a transform, you should do the defaulting in your function.

```javascript
    const { transform } = require('reorient')

    const source = {
      firstName: 'Antony',
      contract: {
        start: Date.now()
      }
    }

    const defaultEndDate = new Date()
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 3)

    const transforms = {
      'firstName': 'firstName',
      'employment.startDate': 'contract.start',
      'employment.endDate': { path: 'contract.endDate', default: defaultEndDate }
    }

    const details = await transform(source, transforms)

    // results in:
    
    details === {
      firstName: 'Antony',
      employment: {
        startDate: 'Fri Aug 03 2017 22:23:10 GMT+0100 (BST)',
        endDate: 'Sat Nov 03 2017 22:23:23 GMT+0000 (GMT)'
      }
    }
```


#### validating

Properties can be passed a validator function, which is passed the value of the transformation, and the original source object

The validator function must return the field value if the field is valid, or throw an error with a validation message.

The example below uses [Joi](https://hapi.dev/module/joi/)

```javascript
    const { transform } = require('reorient')
    const Joi = require('@hapi/joi')

    async function validateNationalInsurance (value, source) {
      const schema = Joi.string().pattern(/^[A-Z]{2}[0-9]{6}[A-Z]$/)
      return schema.validateAsync(nationalInsurance)
    }

    const source = {
      firstName: 'Antony',
      nationalInsurance: 'AA332211B'
    }

    const transforms = {
      'firstName': 'firstName',
      'employment.endDate': { path: 'nationalInsurance', validate: validateNationalInsurance }
    }

    const details = await transform(source, transforms)
```
