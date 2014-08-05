var validations = require('../validations'),
    _ = require('underscore');

module.exports = {
    recursive: function (test) {
        var actualResult = [],
            expectedResult = [
                // FIXME: On Recursive, error message not contain correct field, but contain name of root node
                'Error: {"field2":{}}: Field: field1',
                'Error:  required2 is required.: Field: _required2',
                'Error:  required3 is required.: Field: _required3'
            ],
            mock = {
                field0: true,
                field1: {
                    field2: {
                        _missed1: 0,
                        field23: true
                    },
                    field12: true
                },
                _missed2: 0,
                _missed3: {
                    field6: true
                },
                field7: true,
                field8: {
                    field9: {
                        field10: true
                    }
                }
            },
            pattern = {properties: {
                field0: {required: true},
                field1: {object: {properties: {
                    field2: {object: {properties: {
                        _required1: {required: true},
                        field23: {required: true}
                    }}},
                    field12: {required: true}
                }}},
                _required2: {required: true},
                _required3: {object: {properties: {
                    field6: {required: true}
                }}},
                field7: {required: true},
                field8: {object: {properties: {
                    field9: {
                        object: {properties: {
                            field10: {required: true}
                        }}
                    }
                }}}
            }};

        var err = validations.validate(mock, pattern);

        if (typeof err !== "undefined") {
            err.each(function(error, name) {
                actualResult.push("Error: " + name + ": Field: " + error);
            });
        }

        test.equals(actualResult.join("\n"), expectedResult.join("\n"));
        test.done();
    }
};