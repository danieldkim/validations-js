var util = require('util');
var validations = require('../validations');
var _ = require('underscore')._;
var assert = require('assert');
var nodeunit = require('nodeunit');
    
module.exports = nodeunit.testCase({
  setUp: function(callback) {
    test.o = {};
    test.validation_config = {
      defaultMessages: {},
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
