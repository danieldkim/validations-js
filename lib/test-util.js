var async_testing = require('async_testing'),
    _ = require('underscore'),
    validations = require('../validations');

exports.run = function(filename, suite) {
  if (_.include(process.ARGV, '--debug'))
    setTimeout(function() {
      async_testing.runSuite(suite);
    }, 15000);
  else
    return async_testing.run(filename, process.ARGV);
};

exports.interp_s = function interp_s(tmpl, values) {
  _.each(values, function(v, k) { tmpl = tmpl.replace('{{' + k + '}}', v); });
  return tmpl;
};

exports._test_should_error = function _test_should_error(test, config, msg) {
  var context = this;
  return function(val) {
    context.o.p = val;
    var errors = validations.validate(context.o, config);
    test.ok(errors, "no errors returned.");
    test.ok(errors.on('p'), "no errors on 'p'");
    test.equal(1, errors.on('p').length, "should only have 1 error on 'p'");
    test.equal(msg, errors.on('p')[0]);
  }
};

exports._test_should_not_error = function _test_should_not_error(test, config) {
  var context = this;
  return function(val) {
    context.o.p = val;
    var errors = validations.validate(context.o, config);
    test.equal(true, !errors, "errors is a non-blank value.");
  }
};

exports.test_val_should_error_tuples = function test_val_should_error_tuples(
    val_should_error_tuples, test_should_error, test_should_not_error) {
  _.each(val_should_error_tuples, function(val_should_error) {
    var val = val_should_error[0], should_error = val_should_error[1];
    // require('util').puts(val + ',' + should_error)
    if (should_error) test_should_error(val);
    else test_should_not_error(val);
  });
};