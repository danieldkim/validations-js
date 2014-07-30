var util = require('util');
var validations = require('../validations');
var _ = require('underscore');
var assert = require('assert');
var test_util = require('../lib/test-util');
var nodeunit = require('nodeunit');
    
module.exports = nodeunit.testCase({
  setUp: function(callback) {
    this.o = {};
    this.validation_config = {
      defaultMessages: {
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
    callback();
  },
  tearDown: function(callback) {
    callback();
  },
  
  'format': test_format
});

function test_format(test) {
  var config = this.validation_config,
      msg_tmpl = config.defaultMessages.format.pattern;

  test_util.test_val_should_error_tuples([
      [undefined, false], [null, false], [0, true], [1, true], ["a", true], 
      ["fo", true], ["foo", false], ["ffooo", false]
    ],
    test_util._test_should_error.call(this, test, config, 
      test_util.interp_s(msg_tmpl, {name: 'p', compare_to: config.properties.p.format.pattern})),
    test_util._test_should_not_error.call(this, test, config));
            
  test.done();
}