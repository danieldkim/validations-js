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
        numericality: {}
      },
      properties: {
        p: { 
          numericality: {}
        }
      }
    };
    callback();
  },
  tearDown: function(callback) {
    callback();
  },

  "onlyInteger": test_onlyInteger,
  "even": test_even,
  "odd": test_odd,
  "comparisons": test_comparisons
    
});

function test_onlyInteger(test) {
  test_num_type.call(this, test, 'onlyInteger', "*{{name}} must be an integer.*", [
    ["a", true], ["b", true], [1.1, true], [2.2, true], 
    [1, false], [2, false], [1.0, false], [2.0, false]
  ]);
  test.done();
}

function test_even(test) {
    test_num_type.call(this, test, 'even', "*{{name}} must be even.*", [ 
    [1, true], [2, false], [3, true], [4, false],
    [-1, true], [-2, false], [-3, true], [-4, false]
  ]);
  test.done();
}

function test_odd(test) {
  test_num_type.call(this, test, 'odd', "*{{name}} must be odd.*", [ 
    [1, false], [2, true], [3, false], [4, true],
    [-1, false], [-2, true], [-3, false], [-4, true]
  ]);
  test.done();
}

function test_comparisons(test, comp_type, msg_tmpl, compare_to, val_should_error_tuples) {
  var that = this;  
  [
    [
      "greaterThan", "*{{name}} must be greater than {{compare_to}}.*", 0, 
      [
        [-1, true], ["-1", true], [-0.1, true], ["-0.1", true], [0, true], 
        ["0", true], [0.1, false], ["0.1", false], [1, false], ["1", false]
      ]
    ],
    [
      "greaterThanOrEqualTo", 
      "*{{name}} must be greater than or equal to {{compare_to}}.*", 0, 
      [
          [-1, true], ["-1", true], [-0.1, true], ["-0.1", true], [0, false], 
          ["0", false], [0.1, false], ["0.1", false], [1, false], ["1", false]
      ]
    ],
    [
      "equalTo", "*{{name}} must be equal to {{compare_to}}.*", 0, 
      [
          [-1, true], ["-1", true], [-0.1, true], ["-0.1", true], [0, false], 
          ["0", false], [0.1, true], ["0.1", true], [1, true], ["1", true]
      ]
    ],
    [
      "lessThan", "*{{name}} must be less than {{compare_to}}.*", 0, 
      [
          [-1, false], ["-1", false], [-0.1, false], ["-0.1", false], [0, true], 
          ["0", true], [0.1, true], ["0.1", true], [1, true], ["1", true]
      ]
    ],
    [
      "lessThanOrEqualTo", "*{{name}} must be less than or equal to {{compare_to}}.*", 0, 
      [
          [-1, false], ["-1", false], [-0.1, false], ["-0.1", false], [0, false], 
          ["0", false], [0.1, true], ["0.1", true], [1, true], ["1", true]
      ]
    ]
  ].forEach(function(test_config) {    
    var comp_type = test_config[0], msg_tmpl = test_config[1],
        compare_to = test_config[2], val_should_error_tuples = test_config[3];
    that.validation_config = {
      defaultMessages: {
        numericality: {}
      },
      properties: {
        p: { 
          numericality: {}
        }
      }
    };
    test_num_type.call(that, test, comp_type, msg_tmpl, val_should_error_tuples, compare_to)
  });
  
  test.done();
}

function test_num_type(test, num_type, msg_tmpl, 
    val_should_error_tuples, compare_to) {
  var config = this.validation_config;
  config.defaultMessages.numericality[num_type] = msg_tmpl;
  config.properties.p.numericality[num_type] = 
    compare_to == undefined ? true : compare_to;

  test_util.test_val_should_error_tuples(val_should_error_tuples,
    test_util._test_should_error.call(this, test, config, 
      test_util.interp_s(msg_tmpl, {name: 'p', compare_to: compare_to})),
    test_util._test_should_not_error.call(this, test, config));
}


