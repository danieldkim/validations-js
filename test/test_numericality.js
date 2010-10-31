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
        numericality: {}
      },
      properties: {
        p: { 
          numericality: {}
        }
      }
    };
    done();
  },
  teardown: function(test, done) {
    done();
  },
  suite: {
    "only_integer": test_only_integer,
    "even": test_even,
    "odd": test_odd,
    "comparisons": test_comparisons
  },
  suiteTeardown: function(done) {
    done();
  }  
});

module.exports = { 'Numericality tests': suite };

function test_only_integer(test) {
  test_num_type(test, 'only_integer', "*{{name}} must be an integer.*", [
    ["a", true], ["b", true], [1.1, true], [2.2, true], 
    [1, false], [2, false], [1.0, false], [2.0, false]
  ]);
  test.finish();
}

function test_even(test) {
  test_num_type(test, 'even', "*{{name}} must be even.*", [ 
    [1, true], [2, false], [3, true], [4, false],
    [-1, true], [-2, false], [-3, true], [-4, false]
  ]);
  test.finish();
}

function test_odd(test) {
  test_num_type(test, 'odd', "*{{name}} must be odd.*", [ 
    [1, false], [2, true], [3, false], [4, true],
    [-1, false], [-2, true], [-3, false], [-4, true]
  ]);
  test.finish();
}

function test_comparisons(test, comp_type, msg_tmpl, compare_to, val_should_error_tuples) {  
  [
    [
      "greater_than", "*{{name}} must be greater than {{compare_to}}.*", 0, 
      [
        [-1, true], ["-1", true], [-0.1, true], ["-0.1", true], [0, true], 
        ["0", true], [0.1, false], ["0.1", false], [1, false], ["1", false]
      ]
    ],
    [
      "greater_than_or_equal_to", 
      "*{{name}} must be greater than or equal to {{compare_to}}.*", 0, 
      [
          [-1, true], ["-1", true], [-0.1, true], ["-0.1", true], [0, false], 
          ["0", false], [0.1, false], ["0.1", false], [1, false], ["1", false]
      ]
    ],
    [
      "equal_to", "*{{name}} must be equal to {{compare_to}}.*", 0, 
      [
          [-1, true], ["-1", true], [-0.1, true], ["-0.1", true], [0, false], 
          ["0", false], [0.1, true], ["0.1", true], [1, true], ["1", true]
      ]
    ],
    [
      "less_than", "*{{name}} must be less than {{compare_to}}.*", 0, 
      [
          [-1, false], ["-1", false], [-0.1, false], ["-0.1", false], [0, true], 
          ["0", true], [0.1, true], ["0.1", true], [1, true], ["1", true]
      ]
    ],
    [
      "less_than_or_equal_to", "*{{name}} must be less than or equal to {{compare_to}}.*", 0, 
      [
          [-1, false], ["-1", false], [-0.1, false], ["-0.1", false], [0, false], 
          ["0", false], [0.1, true], ["0.1", true], [1, true], ["1", true]
      ]
    ]
  ].forEach(function(test_config) {    
    var comp_type = test_config[0], msg_tmpl = test_config[1],
        compare_to = test_config[2], val_should_error_tuples = test_config[3];
    test.validation_config = {
      default_messages: {
        numericality: {}
      },
      properties: {
        p: { 
          numericality: {}
        }
      }
    };
    test_num_type(test, comp_type, msg_tmpl, val_should_error_tuples, compare_to)
  });
  
  test.finish();
}

function test_num_type(test, num_type, msg_tmpl, 
    val_should_error_tuples, compare_to) {
  var config = test.validation_config;
  config.default_messages.numericality[num_type] = msg_tmpl;
  config.properties.p.numericality[num_type] = 
    compare_to == undefined ? true : compare_to;

  test_val_should_error_tuples(val_should_error_tuples,
    _test_should_error(test, config, 
      test_util.interp_s(msg_tmpl, {name: 'P', compare_to: compare_to})),
    _test_should_not_error(test, config));
}

function _test_should_error(test, config, msg) {
  return function(val) {
    test.o.p = val;
    var errors = validator.validate(test.o, config);
    test.ok(errors, "no errors returned.");
    test.ok(errors.on('p'), "no errors on 'p'");
    test.equal(1, errors.on('p').length, "should only have 1 error on 'p'");    
    test.equal(msg, errors.on('p')[0]); 
  }
}

function _test_should_not_error(test, config) {
  return function(val) {
    test.o.p = val;
    var errors = validator.validate(test.o, config);
    test.equal(true, !errors, "errors is a non-blank value.");
  }
}

function test_val_should_error_tuples(val_should_error_tuples, test_should_error, test_should_not_error) {
  _.each(val_should_error_tuples, function(val_should_error) {
    var val = val_should_error[0], should_error = val_should_error[1];
    if (should_error) test_should_error(val);
    else test_should_not_error(val);
  });
}

