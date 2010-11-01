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
        format: {
          pattern: '*{{name}} should match pattern {{compare_to}}.*'
        }
      },
      properties: {
        p: {
          format: {
            pattern: /foo/
          }
        }
      }
    };
    done();
  },
  teardown: function(test, done) {
    done();
  },
  suite: {
    'format': test_format
  },
  suiteTeardown: function(done) {
    done();
  }  
});

module.exports = { 'Format tests': suite };

function test_format(test) {
  var errors, config = test.validation_config, 
      msg_tmpl = config.default_messages.format.pattern;

  test_util.test_val_should_error_tuples([
      [undefined, false], [null, false], [0, true], [1, true], ["a", true], 
      ["fo", true], ["foo", false], ["ffooo", false]
    ],
    test_util._test_should_error(test, config, 
      test_util.interp_s(msg_tmpl, {name: 'P', compare_to: config.properties.p.format.pattern})),
    test_util._test_should_not_error(test, config));
            
  test.finish();
}