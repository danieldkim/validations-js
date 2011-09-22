require.paths.unshift('./lib');

var util = require('util');
var validations = require('validations');
var _ = require('underscore')._;
var assert = require('assert');
var test_util = require('test-util');
var nodeunit = require('nodeunit');
    
module.exports = nodeunit.testCase({
  setUp: function(callback) {
    test.o = {};
    test.validation_config = {
      default_messages: {},
      properties: {
        p: {}
      }
    };
    callback();
  },
  tearDown: function(callback) {
    callback();
  }
});

