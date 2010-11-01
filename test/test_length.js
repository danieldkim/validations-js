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
        length: {}
      },
      properties: {
        p: {
          length: {}
        }
      }
    };
    done();
  },
  teardown: function(test, done) {
    done();
  },
  suite: {
    'is': test_is,
    'min': test_min,
    'max': test_max
  },
  suiteTeardown: function(done) {
    done();
  }  
});

module.exports = { 'Length tests': suite };

function test_is(test) {
  var errors, config = test.validation_config, 
      msg_tmpl = config.default_messages.required;

  test_length(test, "is", "*{{name}} must be of length {{compare_to}}.*", [
    [undefined, false], [null, false], [0, false], [1, false], 
    [11, true], ["", true], ["a", false], ["aa", true]
  ], 1);
            
  test.finish();
}

function test_min(test) {
  var errors, config = test.validation_config, 
      msg_tmpl = config.default_messages.required;

  test_length(test, "min", "*{{name}} must be at least {{compare_to}} characters.*", [
    [undefined, false], [null, false], [0, false], [1, false], 
    [11, false], ["", true], ["a", false], ["aa", false]
  ], 1);
            
  test.finish();
}

function test_max(test) {
  var errors, config = test.validation_config, 
      msg_tmpl = config.default_messages.required;

  test_length(test, "max", "*{{name}} must be at most {{compare_to}} characters.*", [
    [undefined, false], [null, false], [0, false], [1, false], 
    [11, true], ["", false], ["a", false], ["aa", true]
  ], 1);
            
  test.finish();
}

function test_length(test, length_type, msg_tmpl, 
    val_should_error_tuples, compare_to) {
  var config = test.validation_config;
  config.default_messages.length[length_type] = msg_tmpl;
  config.properties.p.length[length_type] = 
    compare_to == undefined ? true : compare_to;

  test_util.test_val_should_error_tuples(val_should_error_tuples,
    test_util._test_should_error(test, config, 
      test_util.interp_s(msg_tmpl, {name: 'P', compare_to: compare_to})),
    test_util._test_should_not_error(test, config));
}