require.paths.unshift('./lib');

var sys = require('sys');
var validator = require('validator');
var _ = require('underscore')._;
var assert = require('assert');
var test_util = require('test-util');
var async_testing = require('async_testing')
  , wrap = async_testing.wrap
  ;

// if this module is the script being run, then run the tests:  
if (module == require.main) {
  test_util.run(__filename, suite);
}
    
var suite = wrap({
  suiteSetup: function(done) {
    done();
  },
  setup: function(test, done) {
    test.o = {};
    test.validation_config = {
      default_messages: {
        required: '*{{name}} is required.*'
      },
      properties: {
        p: {
          required: true
        }
      }
    };
    done();
  },
  teardown: function(test, done) {
    done();
  },
  suite: {
    'required': test_required
  },
  suiteTeardown: function(done) {
    done();
  }  
});

module.exports = { 'Required tests': suite };

function test_required(test) {
  var errors, config = test.validation_config, 
      msg_tmpl = config.default_messages.required;

  test_util.test_val_should_error_tuples([
      [undefined, true], [null, true], [0, false],
      [1, false], ["a", false], [true, false]
    ],
    test_util._test_should_error(test, config, 
      test_util.interp_s(msg_tmpl, {name: 'P'})),
    test_util._test_should_not_error(test, config));
            
  test.finish();
}