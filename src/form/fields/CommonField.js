/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import template from './templates/CommonField.hbs';
import '../../libApi';
import dropdown from '../../dropdown/dropdownApi';
import FieldInfoModel from './models/FieldInfoModel';
import InfoButtonView from './views/InfoButtonView';
import InfoMessageView from './views/InfoMessageView';

const classes = {
    REQUIRED: 'required',
    READONLY: 'readonly',
    DISABLED: 'disabled'
};

const ui = {
    errorText: '.js-error-text'
};

export default Backbone.Form.Field.extend({
    initialize: function (options) {
        Backbone.Form.Field.prototype.initialize.apply(this, arguments);
        this.debounceValidate = _.debounce(function () {
            this.validate();
            this.editor.trigger('validated', this);
        }.bind(this), this.form.validationDelay);
        if (this.schema.autoValidate) {
            this.editor.on('change', function () {
                this.debounceValidate();
            }.bind(this));
            this.editor.on('blur', function () {
                this.validate();
                this.editor.trigger('validated', this);
            }.bind(this));
        }
        this.editor.on('readonly', function (readonly) {
            this.__updateEditorState(readonly, this.editor.getEnabled());
        }.bind(this));
        this.editor.on('enabled', function (enabled) {
            this.__updateEditorState(this.editor.getReadonly(), enabled);
        }.bind(this));
    },

    validate: function (options) {
        options = options || {};
        if (this.schema.validators) {
            var error = this.editor.validate();
            if (!options.silent) {
                if (error) {
                    this.setError(error.message);
                } else {
                    this.clearError();
                }
            }
            return error;
        }
        return null;
    },

    setError: function (msg) {
        if (this.editor.hasNestedForm) {
            return;
        }
        this.$el.addClass(this.errorClassName);
        this.$(ui.errorText).text(msg);
    },

    clearError: function () {
        this.$el.removeClass(this.errorClassName);
        this.$(ui.errorText).text('');
    },

    render: function () {
        Backbone.Form.Field.prototype.render.apply(this, arguments);
        if (this.schema.helpText) {
            this.fieldInfoModel = new FieldInfoModel({
                text: this.schema.helpText
            });
            var infoPopout = dropdown.factory.createPopout({
                panelView: InfoMessageView,
                panelViewOptions: {
                    model: this.fieldInfoModel
                },
                buttonView: InfoButtonView,
                buttonViewOptions: {
                    model: this.fieldInfoModel
                },
                popoutFlow: 'right',
                customAnchor: true
            });
            infoPopout.render();
            this.$('.js-field-info').append(infoPopout.$el);
            infoPopout.onRender();
        }
        if (this.schema.required) {
            this.$el.addClass(classes.REQUIRED);
        }
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
        return this;
    },

    __updateEditorState: function (readonly, enabled) {
        this.$el.toggleClass(classes.READONLY, readonly);
        this.$el.toggleClass(classes.DISABLED, readonly || !enabled);
    }
}, {
    template: template
});
