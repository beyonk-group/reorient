# reorient

[![Build Status](https://travis-ci.org/desirable-objects/reorient.svg?branch=master)](https://travis-ci.org/desirable-objects/reorient)

Transforms an object from one form into another form much like [Hoek.transform](https://github.com/hapijs/hoek/blob/master/API.md#transformobj-transform-options), but allows methods as transformation values, which are called during transformation, and passed the original source object.

This allows for more useful transformations as shown in Usage.

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

    const result = transform(source, transforms)
    
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

    const result = transform(source, transforms)
    
    // results in:
    
    result === [
      'Antony Jones',
      'Developer'
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

    const result = transform(source, transforms, { trim: true })

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

    const details = transform(source, transforms)

    // results in:
    
    details === {
      firstName: 'Antony',
      employment: {
        startDate: 'Fri Aug 03 2017 22:23:10 GMT+0100 (BST)',
        endDate: 'Sat Nov 03 2017 22:23:23 GMT+0000 (GMT)'
      }
    }
```
