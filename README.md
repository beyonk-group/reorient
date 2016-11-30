# reorient

[![Build Status](https://travis-ci.org/desirable-objects/reorient.svg?branch=master)](https://travis-ci.org/desirable-objects/reorient)

Transforms an object from one form into another form much like [Hoek.transform](https://github.com/hapijs/hoek/blob/master/API.md#transformobj-transform-options), but allows methods as transformation values, which are called during transformation, and passed the original source object.

This allows for more useful transformations as shown in Usage.

## Documentation

See Hoek.transform docs (linked above) for basic usage, see below for advanced usage.

## Usage

```
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

    const transformationData = {
      'fullName': buildFullName,
      'job.title', 'job.role'
    }

    const address = transform(source, transforms)
    
    // results in:
    
    address === {
      fullName: 'Antony Jones',
      job: {
        title: 'Developer'
      }
    }
```
