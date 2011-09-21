var _ = require('underscore')._;
var sys = require('sys');
require('inflection');

var global_default_messages = {
  required: "{{name}} is required.",
  length: {
    is: "{{name}} must be exactly {{compare_to}} characters.",
    min: "{{name}} must be at least {{compare_to}} characters.",
    max: "{{name}} must not exceed {{compare_to}} characters."
  },
  numericality: {
    only_integer: "{{name}} must be an integer.",
    greater_than: "{{name}} must be greater than {{compare_to}}",
    greater_than_or_equal_to: "{{name}} must be greater than or equal to {{compare_to}}.",
    equal_to: "{{name}} must be equal to {{compare_to}}.",
    less_than: "{{name}} must be less than {{compare_to}}.",
    less_than_or_equal_to: "{{name}} must be less than or equal to {{compare_to}}.",
    odd: "{{name}} must be an odd number.",
    even: "{{name}} must be an even number."    
  },
  format: {
    pattern: "{{name}} is not formatted correctly."
  }
}

var new_errors= exports.new_errors = function() {
  var _errors = {};
  return {
    errors: function() {return _errors},
    add: function(name, error) {
      if (!error) return;
      if (typeof error == 'string') {
        var messages = _errors[name];
        if (!messages) _errors[name] = messages = [];
        messages.push(error);        
      } else {
        _errors[name] = error;
      }
    },
    add_to_base: function(error) {
      this.add('_base', error);
    },
    clear: function() {
      _errors = {};
    },
    count: function() {
      return this.size();
    },
    each: function(callback) {
      _.each(_errors, function(errors, name) {
        callback(name, errors);
      })
    },
    is_empty: function() {
      return _.isEmpty(_errors);
    },
    messages: function() {
      return _.flatten(_.values(_errors));
    },
    is_invalid: function(name) {
      var error = _errors[name];
      if (!error) return false;
      if (typeof error == 'array') return error.length > 0;
      else return true;
    },
    length: function(){
      return this.size();
    },
    on: function(name) {
      return _errors[name];
    }, 
    on_base: function() {
      return _errors['_base'];
    },
    size: function() {
      return _.size(_errors);
    },
    toString: function() {
      return sys.inspect(_errors);
    }
  };
}

function is_blank(v) { return v === undefined || v === null || v === ''; }

var valid_funcs = {
  required: function(val) {return !is_blank(val);},
  length: {
    is: function(val, compare_to) {return val.toString().length == compare_to;},
    max: function(val, compare_to) {return val.toString().length <= compare_to; },
    min: function(val, compare_to) {return val.toString().length >= compare_to; }
  },
  numericality: {
    only_integer: function(val) {return parseInt(val) == val;}, 
    odd: function(val) {return Math.abs(val) % 2 == 1;}, 
    even: function(val) {return val % 2 == 0;}, 
    greater_than: function(val, compare_to) {return val > compare_to;},
    greater_than_or_equal_to: function(val, compare_to) {return val >= compare_to;} ,
    equal_to: function(val, compare_to) {return val == compare_to;} ,
    less_than: function(val, compare_to) {return val < compare_to;} ,
    less_than_or_equal_to: function(val, compare_to) {return val <= compare_to;} 
  },
  format: {
    pattern: function(val, compare_to) {return val.toString().match(compare_to);}
  }
}
// we want to execute the validations in this order
var validation_types = ['required', 'length', 'numericality', 'format'];

var interpolation_scope_extractors = {
  length: {
    count: function(val) {return {count: val.length};},
    is: function(val) {return {count: val.length};},
    min: function(val) {return {count: val.length};},
    max: function(val) {return {count: val.length};},
  }
};

exports.validate = function validate(obj, config) {  
  
  var errors = new_errors();
  var default_messages = config.default_messages || {};
  _.without(validation_types, 'required').forEach(function(validation_type) {
    if (!default_messages[validation_type]) default_messages[validation_type] = {};
  });

  function test_and_add_error_message(prop_name, prop_config, validation_type, value, subtype) {
    if (!prop_config[validation_type]) return;
    var valid_func, compare_to, interpolation_scope_extractor;
    if (subtype) {
      if (prop_config[validation_type][subtype] == undefined) return;
      valid_func = valid_funcs[validation_type][subtype];
      compare_to = prop_config[validation_type][subtype];
      if (interpolation_scope_extractors[validation_type]) 
        interpolation_scope_extractor = interpolation_scope_extractors[validation_type][subtype];
    } else { 
      valid_func = valid_funcs[validation_type];
      compare_to = prop_config[validation_type];
      interpolation_scope_extractor = interpolation_scope_extractors[validation_type];
    }
    if (!valid_func(value, compare_to)) {
      var msg = prop_config.message;
      if (subtype) {
        msg = msg  || default_messages[validation_type][subtype] || 
                global_default_messages[validation_type][subtype];
      } else {
        msg = msg  || default_messages[validation_type] || 
                global_default_messages[validation_type];
      }
      var vars;
      if (interpolation_scope_extractor)
        vars = interpolation_scope_extractor(value);
      errors.add(prop_name, interpolate_msg(msg, prop_name, value, compare_to, vars));
      return false;
    } else {
      return true;
    }
  }
  
  _.forEach(config.properties, function(prop_config, prop_name) {
    var value = obj[prop_name];
    if (prop_config.object) {
      // recurse
      errors.add(prop_name, validate(value, prop_config.object));
      return; // no other validation types should apply if validation type is 'object'
    }
    for (var i = 0; i < validation_types.length; i++) {
      var validation_type = validation_types[i];
      if (!prop_config[validation_type]) continue;
      if (validation_type != 'required' && is_blank(value)) continue;
      if (typeof valid_funcs[validation_type] == 'function') {
        var is_valid = test_and_add_error_message(prop_name, prop_config, 
                         validation_type, value);
        if (!is_valid && validation_type == 'required') break;
      } else {
        _.keys(valid_funcs[validation_type]).forEach(function(subtype) {
          test_and_add_error_message(prop_name, prop_config, validation_type, 
            value, subtype);
        });        
      }
    }
  });
  if (!errors.is_empty()) return errors;
}

function interpolate_msg(msg, name, value, compare_to, vars) {
  var interp_msg = msg.replace(/{{name}}/, name.humanize()).
                       replace(/{{value}}/, value).
                       replace(/{{compare_to}}/, compare_to);
  if (vars)
    _.forEach(vars, function(val, name) {
      interp_msg = interp_msg.replace('{{'+name+'}}', val); 
    });
  return interp_msg;
}
