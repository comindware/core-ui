/**
 * Developer: Stepan Burguchev
 * Date: 12/12/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import CommonField from './fields/CommonField';

/**
 * @name ExtendedForm
 * @memberof module:core.form
 * @class [Backbone.Form](https://github.com/powmedia/backbone-forms) extended with some additional features.
 * @extends Backbone.Form
 * */

export default Backbone.Form.extend(/** @lends module:core.form.ExtendedForm.prototype */ {
    focusRequiredInput: function () {
        this.methodOptions.silent = true;
        var errors = this.validate();
        this.methodOptions.silent = false;
        var self = this;
        if (errors) {
            var fieldToFocus = _.chain(_.keys(errors))
                .map(function (key) {
                    return self.fields[key];
                })
                .filter(function (field) {
                    return !_.isUndefined(field.schema.tabIndex);
                })
                .sortBy(function (field) {
                    return field.schema.tabIndex;
                })
                .first()
                .value();
            if (fieldToFocus) {
                fieldToFocus.focus();
            }
        }
    },

    name: 'form',

    handleEditorEvent: function (event, editor, field) {
        var formEvent = this.name + ':' + event;
        if (event !== 'validated') {
            //Re-trigger editor events on the form
            this.trigger.call(this, formEvent, this, editor, Array.prototype.slice.call(arguments, 2));
        }

        //Trigger additional events
        switch (event) {
            case 'statechanged':
                this.state = editor.state;
                break;
            case 'change':
                this.trigger('change', this, editor);
                this.trigger(editor.key + ':change', this, editor);
                break;
            case 'focus':
                if (!this.hasFocus) {
                    this.trigger('focus', this);
                }
                break;
            case 'blur':
                if (this.hasFocus) {
                    var self = this;
                    _.defer(function () {
                        var focusedField = _.find(self.fields, function (field) {
                            return field.editor.hasFocus;
                        });

                        if (!focusedField) {
                            self.trigger('blur', self);
                        }
                    });
                }
                break;
            case 'validated':
                this.validate({
                    silent: true
                });
                break;
            case 'resize':
                $(window).trigger('resize');
                break;
        }
    },

    setErrors: function(errors) {
        _.each(_.pairs(errors), function(pair) {
            var field = this.fields[pair[0]];
            if (field) {
                field.setError(pair[1]);
            }
        }.bind(this));
    },

    onShow: function () {
        this.validate({
            silent: true
        });
        _.each(this.fields || {}, function (v) {
            if (v.editor.onShow) {
                v.editor.onShow();
            }
        });
    },

    /**
     * Validate the data
     * @return {Object} Validation errors
     */
    validate: function (options) {
        var self = this,
            fields = this.fields,
            model = this.model,
            errors = {};

        options = options || {};

        //Collect errors from schema validation
        _.each(fields, function (field) {
            var error = field.validate(options);
            if (error) {
                errors[field.key] = error;
            }
        });

        //Get errors from default Backbone model validator
        if (!options.skipModelValidate && model && model.validate) {
            var modelErrors = model.validate(this.getValue());

            if (modelErrors) {
                var isDictionary = _.isObject(modelErrors) && !_.isArray(modelErrors);

                //If errors are not in object form then just store on the error object
                if (!isDictionary) {
                    errors._others = errors._others || [];
                    errors._others.push(modelErrors);
                }

                //Merge programmatic errors (requires model.validate() to return an object e.g. { fieldKey: 'error' })
                if (isDictionary) {
                    _.each(modelErrors, function (val, key) {
                        //Set error on field if there isn't one already
                        if (fields[key] && !errors[key]) {
                            fields[key].setError(val);
                            errors[key] = val;
                        }

                        else {
                            //Otherwise add to '_others' key
                            errors._others = errors._others || [];
                            var tmpErr = {};
                            tmpErr[key] = val;
                            errors._others.push(tmpErr);
                        }
                    });
                }
            }
        }

        var result = _.isEmpty(errors) ? null : errors;
        this.trigger('form:validated', !result, result);
        return result;
    },

    validationDelay: 1000,

    Field: CommonField
});
