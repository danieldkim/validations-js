# validator-js

validator-js is a validation library for JavaScript objects modeled loosely on
[ActiveRecord validations](
http://ar.rubyonrails.org/classes/ActiveRecord/Validations/ClassMethods.html ).
Currently supports options to validate requiredness, length, numericality, and
format.

## Requirements

* Node.js >0.2.4
* [Underscore.js](http://documentcloud.github.com/underscore/) 1.0.2
* [inflection-js](http://code.google.com/p/inflection-js/) r37
* [node-async-testing](http://github.com/bentomas/node-async-testing) 0.4.0
  (optional, only needed to run tests)

## Usage

To use the validator library, require validator.js and call the validator
function, passing it the object to be validated and a validation configuration,
like so:

    var validator = require('validator');
    var errors = validator.validate(my_object, my_validation_config);
  
The various configuration options and the api for the errors object that is
returned are discussed below.
  
### Validation configuration

To specify the rules for the properties of an object, set the *properties*
property of the validation configuration with a hash that contains the
configuration for each property. For example, validating that an object has a
required property can be done like so:

    var errors = validator.validate(my_object, {
      properties: { 
        my_prop: {
          required: true
        }
      }
    });

To validate the length of property use the *length* option:  

    var errors = validator.validate(my_object, {
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

You can specify multiple options on a single property:

    var errors = validator.validate(my_object, {
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

**Note: if a property is not required and it's blank (undefined or null), any
other validation options defined for that property will not be applied.**

These are all the validation options:

* required
* length
    * is
    * min
    * max
* numericality
    * only\_integer
    * greater\_than
    * greater\_than\_or\_equal\_to
    * equal\_to 
    * less\_than
    * less\_than\_or\_equal_to
    * odd 
    * even
* format
    * pattern
    
#### Message configuration

validator-js comes packaged with a default set of error messages for each of the validation options:

    {
      required: "{{name}} is required.",
      length: {
        is: "{{name}} must be exactly {{compare_to}} characters.",
        min: "{{name}} must be at least {{compare_to}} characters.",
        max: "{{name}} must not exceed {{compare_to}} characters."
      },
      numericality: {
        only_integer: "{{name}} must be an integer.",
        greater_than: "{{name}} must be greater than {{compare_to}}",
        greater_than_or_equal_to: "{{name}} must be greater than or equal to {{compare_to}}.",
        equal_to: "{{name}} must be equal to {{compare_to}}.",
        less_than: "{{name}} must be less than {{compare_to}}.",
        less_than_or_equal_to: "{{name}} must be less than or equal to {{compare_to}}.",
        odd: "{{name}} must be an odd number.",
        even: "{{name}} must be an even number."    
      },
      format: {
        pattern: "{{name}} is not formatted correctly."
      }
    }

*{{name}}* gets replaced with the name of the property in error, and
*{{compare\_to}}* gets replaced with the value that the object property was
compared to, if relevant.

Any of these messages can be overridden by specifying a message option on the
property configuration like so:

    var errors = validator.validate(my_object, {
      properties: { 
        my_prop: {
          required: true,
          message: "Where the hell is {{name}}?"
        }
      }
    });

If you would like to override the message for a particular option for all
properties in a configuration, you can pass a *default\_messages* configuration
like so:

    var errors = validator.validate(my_object, {
      default_messages: {
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

### Errors object

The errors object returned by the *validate* function acts like the ActiveRecord
Validations errors objects. 

Here are the methods available:

* count() - returns the total number of errors found.  alias for *size()*.

* each(callback) - iterates through all the properties for which an error was
  found, passing errors and name of property to *callback*.  e.g.:
  <pre>
  errors\_result.each(function(errors, name) {
    sys.puts("Errors on " + name + ":" + errors.join(" "));
  })
  </pre>
  *errors* is an normally an array of error messages.  When using recursion, 
  *errors* may be a child errors object on which all of these methods can be
  called. 
  
* is_empty() - return true if there no errors.

* messages() - returns all error messages in an array.

* is_invalid(name) - returns true if an error was found with *name*.

* length() - returns the total number of errors found.  alias for *size()*.

* on(name) - returns all of the error messages for *name* as an array.

* size() - returns the total number of errors found.

### Recursion

validator-js can validate recursively. A property of an object can be an object
that has its own configuration. Use the *object* option to specify a
sub-configuration for an object property. For example, let's say you had an
object representing a place, with a *location* property that is itself an object
with a *lat* and *lon* property. You might validate it like so:

    var errors = validator.validate(place, {
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
                numericality: {greater_than_or_equal_to: -90, less_than_or_equal_to: 90}
              },
              lon: {
                required: true,
                numericality: {greater_than_or_equal_to: -180, less_than_or_equal_to: 180}
              }
            }
          }
        }
      }
    })

The errors object returned by *validate* is also recursive. You would detect and
display an error with the *lat* property like so:

    if (!is_blank(errors) 
        && errors.is_invalid("location") 
        && errors.on("location").is_invalid("lat"))
      sys.puts("Problem with lat: " + errors.on("location").on("lat").join(" "));

