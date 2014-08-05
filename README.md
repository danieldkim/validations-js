# validations-js

[![Build Status](https://travis-ci.org/danieldkim/validations-js.png)](https://travis-ci.org/danieldkim/validations-js)

validations-js is a validation library for JavaScript objects modeled loosely on
[ActiveRecord validations](http://ar.rubyonrails.org/classes/ActiveRecord/Validations/ClassMethods.html).
Currently supports options to validate requirements, length, numericality, and
format.

## Requirements

* [Underscore.js](http://documentcloud.github.com/underscore/)

* [inflections-js](http://code.google.com/p/inflection-js/) (only when running in browser)

* [Underscore.string](https://github.com/edtsech/underscore.string) (only when running on Node.js)

* JSON.stringify() support

* Node.js and [nodeunit](https://github.com/caolan/nodeunit) (optional, only
  needed to run tests)

## Usage

You can install using npm:

```
$ npm install validations
```

Or download the `validations.js` file from github.

To use the validations library in Node.js require validations.js and call the
validations function, passing it the object to be validated and a validation
configuration, like so:

```javascript
var validations = require('validations');
var errors = validations.validate(my_object, my_validation_config);
```

If using in the browser include underscore.js, inflection.js, validations.js
and, if necessary,
[json2.js](https://github.com/douglascrockford/JSON-js/blob/master/json2.js) in
your page instead of using <code>require()</code>;

The various configuration options and the api for the errors object that is
returned are discussed below.

### Validation configuration

To specify the rules for the properties of an object, set the *properties*
property of the validation configuration with a hash that contains the
configuration for each property. For example, validating that an object has a
required property can be done like so:

```javascript
var errors = validations.validate(my_object, {
  properties: {
    my_prop: {
      required: true
    }
  }
});
```

To validate the length of property use the *length* option:

```javascript
var errors = validations.validate(my_object, {
  properties: {
    my_prop_a: {
      length: {
        is: 1
      }
    },
    my_prop_b: {
      length: {
        is: 2
      }
    },
    my_prop_b: {
      length: {
        min: 1
      }
    }
  }
});
```

You can specify multiple options on a single property:

```javascript
var errors = validations.validate(my_object, {
  properties: {
    my_prop_a: {
      required: true,
      length: {
        min: 1,
        max: 10
      }
    }
  }
});
```

**Note: if a property is not required and it's blank (undefined or null), any
other validation options defined for that property will not be applied.**

These are all the validation options:

* required
* length
    * is
    * min
    * max
* numericality
    * onlyInteger
    * greaterThan
    * greaterThanOrEqualTo
    * equalTo
    * lessThan
    * lessThanOrEqualTo
    * odd
    * even
* format
    * pattern

#### Message configuration

validations-js comes packaged with a default set of error messages for each of the validation options:

```javascript
{
  required: "{{name}} is required.",
  length: {
    is: "{{name}} must be exactly {{compare_to}} characters.",
    min: "{{name}} must be at least {{compare_to}} characters.",
    max: "{{name}} must not exceed {{compare_to}} characters."
  },
  numericality: {
    onlyInteger: "{{name}} must be an integer.",
    greaterThan: "{{name}} must be greater than {{compare_to}}",
    greaterThanOrEqualTo: "{{name}} must be greater than or equal to {{compare_to}}.",
    equalTo: "{{name}} must be equal to {{compare_to}}.",
    lessThan: "{{name}} must be less than {{compare_to}}.",
    lessThanOrEqualTo: "{{name}} must be less than or equal to {{compare_to}}.",
    odd: "{{name}} must be an odd number.",
    even: "{{name}} must be an even number."
  },
  format: {
    pattern: "{{name}} is not formatted correctly."
  }
}
```

*{{name}}* gets replaced with the name of the property in error, and
*{{compare\_to}}* gets replaced with the value that the object property was
compared to, if relevant.

Any of these messages can be overridden by specifying a message option on the
property configuration like so:

```javascript
var errors = validations.validate(my_object, {
  properties: {
    my_prop: {
      required: true,
      message: "Where the hell is {{name}}?"
    }
  }
});
```

If you would like to override the message for a particular option for all
properties in a configuration, you can pass a *defaultMessages* configuration
like so:

```javascript
var errors = validations.validate(my_object, {
  defaultMessages: {
    length: {
      is: "{{name}} must be {{compare_to}} characters in length, no more, no less."
    }
  },
  properties: {
    my_prop_a: {
      length: {
        is: 1
      }
    },
    my_prop_b: {
      length: {
        is: 2
      }
    }
  }
});
```

### Errors object

The errors object returned by the *validate* function acts like the ActiveRecord
Validations errors objects.

Here are the methods available:

* count() - returns the total number of errors found.  alias for *size()*.

* each(callback) - iterates through all the properties for which an error was
  found, passing errors and name of property to *callback*.  e.g.:
  <pre>
  errors\_result.each(function(errors, name) {
    util.puts("Errors on " + name + ":" + errors.join(" "));
  })
  </pre>
  *errors* is an normally an array of error messages.  When using recursion,
  *errors* may be a child errors object on which all of these methods can be
  called.

* isEmpty() - return true if there no errors.

* messages() - returns all error messages in an array.

* isInvalid(name) - returns true if an error was found with *name*.

* length() - returns the total number of errors found.  alias for *size()*.

* on(name) - returns all of the error messages for *name* as an array.

* size() - returns the total number of errors found.

### Recursion

validations-js can validate recursively. A property of an object can be an object
that has its own configuration. Use the *object* option to specify a
sub-configuration for an object property. For example, let's say you had an
object representing a place, with a *location* property that is itself an object
with a *lat* and *lon* property. You might validate it like so:

```javascript
var errors = validations.validate(place, {
  properties: {
    name: {
      required: true,
      length: {min: 1, max: 80}
    },
    location: {
      object: {
        properties: {
          lat: {
            required: true,
            numericality: {greaterThanOrEqualTo: -90, lessThanOrEqualTo: 90}
          },
          lon: {
            required: true,
            numericality: {greaterThanOrEqualTo: -180, lessThanOrEqualTo: 180}
          }
        }
      }
    }
  }
});
```

The errors object returned by *validate* is also recursive. You would detect and
display an error with the *lat* property like so:

```javascript
if (!isBlank(errors)
    && errors.isInvalid("location")
    && errors.on("location").isInvalid("lat"))
  util.puts("Problem with lat: " + errors.on("location").on("lat").join(" "));
```

**Note:** all nodes in a path must exist.

For example if the object you're validating looks like:

```javascript
var obj = {
    firstNode: {
      wrongNode: {
        thirdNode: true
      }
    }
  };
```

And your validation pattern looks like:

```javascript
var errors = validations.validate(obj, {
  properties: {
    firstNode: {
      object: {
        properties: {
          secondNode: {
            object: {
              properties: {
                thirdNode: true
              }
            }
          }
        }
      }
    }
  }
});
```

You will get an error message that one of the nodes in the path is missing.

## License

Copyright (c) 2010 Daniel Kim and other [contributors](https://github.com/danieldkim/validations-js/graphs/contributors).

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.
