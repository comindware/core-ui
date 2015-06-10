/* global define, $, _, Backbone */

define(['./fields/CommonField'], function (CommonField) {
    "use strict";

    //noinspection JSUnresolvedFunction,UnnecessaryLocalVariableJS
	var ExtendedForm = Backbone.Form.extend({
		focusRequiredInput: function () {
			var errors = this.silentValidate();
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
			//Re-trigger editor events on the form
			this.trigger.call(this, formEvent, this, editor, Array.prototype.slice.call(arguments, 2));

			//Trigger additional events
			switch (event) {
				case 'statechanged':
                    this.state = editor.state;
                    break;
				case 'change':
                    this.trigger('change', this);
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
                    if (this.lockSubmit) {
                        this.checkLockedSubmit();
                    }
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
			if (this.lockSubmit) {
				this.checkLockedSubmit();
				$(this.submitAction).on('click', function (e) {
					if ($(this).is(':disabled')) {
						e.stopPropagation();
						e.preventDefault();
					}
				});
			}
            _.each(this.fields || {}, function (v) {
                if (v.editor.onShow) {
                    v.editor.onShow();
                }
            });
		},

		checkLockedSubmit: function () {
			var errors = this.silentValidate();
            var $submitElem = $(this.submitAction);
		    if (errors) {
		        if (!this.locked) {
		            this.locked = true;
			    if (!$submitElem.is(':disabled')) {
		                $submitElem.prop('disabled', true);
		            }
		        }
		    } else {
		        this.locked = false;
		    	if ($submitElem.is(':disabled')) {
	                    $submitElem.prop('disabled', false);
	                }
		    }
		},

		validationDelay: 1000,

		silentValidate: function () {
			this.silentValidation = true;
			var errors = this.validate();
			this.silentValidation = false;
			return errors;
		},
		Field: CommonField
	});
	return ExtendedForm;
});