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
        required: '*{{name}} is required.*'
      },
      properties: {
        p: {
          required: true
        }
      }
    };
    callback();
  },
  tearDown: function(callback) {
    callback();
  },

  'required': test_required
});

function test_required(test) {
  var config = this.validation_config,
      msg_tmpl = config.defaultMessages.required;

  test_util.test_val_should_error_tuples([
      [undefined, true], [null, true], ["", true], [0, false],
      [1, false], ["a", false], [true, false]
    ],
    test_util._test_should_error.call(this, test, config, 
      test_util.interp_s(msg_tmpl, {name: 'p'})),
    test_util._test_should_not_error.call(this, test, config));
            
  test.done();
}