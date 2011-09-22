require.paths.unshift('./lib');

var sys = require('sys');
var validations = require('validations');
var _ = require('underscore')._;
var assert = require('assert');
var test_util = require('test-util');
var nodeunit = require('nodeunit');
    
module.exports = nodeunit.testCase({
  setUp: function(callback) {
    this.o = {};
    this.validation_config = {
      default_messages: {
        length: {}
      },
      properties: {
        p: {
          length: {}
        }
      }
    };
    callback();
  },
  tearDown: function(callback) {
    callback();
  },
  'is': test_is,
  'min': test_min,
  'max': test_max
});

function test_is(test) {
  var errors, config = this.validation_config, 
      msg_tmpl = config.default_messages.required;

  test_length.call(this, test, "is", "*{{name}} must be of length {{compare_to}}.*", [
    [undefined, false], [null, false], [0, false], [1, false], 
    [11, true], ["", true], ["a", false], ["aa", true]
  ], 1);
            
  test.done();
}

function test_min(test) {
  var errors, config = this.validation_config, 
      msg_tmpl = config.default_messages.required;

  test_length.call(this, test, "min", "*{{name}} must be at least {{compare_to}} characters.*", [
    [undefined, false], [null, false], [0, false], [1, false], 
    [11, false], ["", true], ["a", false], ["aa", false]
  ], 1);
            
  test.done();
}

function test_max(test) {
  var errors, config = this.validation_config, 
      msg_tmpl = config.default_messages.required;

  test_length.call(this, test, "max", "*{{name}} must be at most {{compare_to}} characters.*", [
    [undefined, false], [null, false], [0, false], [1, false], 
    [11, true], ["", false], ["a", false], ["aa", true]
  ], 1);
            
  test.done();
}

function test_length(test, length_type, msg_tmpl, 
    val_should_error_tuples, compare_to) {
  var config = this.validation_config;
  config.default_messages.length[length_type] = msg_tmpl;
  config.properties.p.length[length_type] = 
    compare_to == undefined ? true : compare_to;

  test_util.test_val_should_error_tuples(val_should_error_tuples,
    test_util._test_should_error.call(this, test, config, 
      test_util.interp_s(msg_tmpl, {name: 'p', compare_to: compare_to})),
    test_util._test_should_not_error.call(this, test, config));
}