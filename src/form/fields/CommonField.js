/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import template from './templates/CommonField.hbs';
import { Handlebars } from '../../libApi';
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

export default Marionette.LayoutView.extend({
    regions: {
        editorRegion: '.js-editor-region'
    },

    template: Handlebars.compile(template)
});

export default Backbone.Form.Field.extend({
    /**
     * Constructor
     *
     * @param {Object} options.key
     * @param {Object} options.form
     * @param {Object} [options.schema]
     * @param {Backbone.Model} [options.model]
     * @param {Object} [options.value]
     */
    initialize: function (options) {
        options = options || {};

        _.extend(this, _.pick(options, 'form', 'key', 'model', 'value'));

        this.schema = this.__createSchema(options.schema);
        this.template = this.constructor.template;
        this.errorClassName = this.constructor.errorClassName;

        this.editor = this.__createEditor();

        this.debounceValidate = _.debounce(function () {
            this.validate();
            this.editor.trigger('validated', this);
        }.bind(this), this.form && this.form.validationDelay || 100);
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

    /**
     * Check the validity of the field
     *
     * @return {String}
     */
    validate: function () {
        var error = this.editor.validate();
        if (error) {
            this.setError(error.message);
        } else {
            this.clearError();
        }
        return error;
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
        var $field = $($.trim(this.template(_.result(this, 'templateData'))));

        //Render editor
        $field.find('[data-editor]').add($field).each(function (i, el) {
            var $container = $(el),
                selection = $container.attr('data-editor');

            if (_.isUndefined(selection)) return;

            $container.append(this.editor.render().el);
        }.bind(this));

        this.setElement($field);

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

    setRequired: function (required) {
        this.$el.toggleClass(classes.REQUIRED, required);
    },

    __updateEditorState: function (readonly, enabled) {
        this.$el.toggleClass(classes.READONLY, readonly);
        this.$el.toggleClass(classes.DISABLED, readonly || !enabled);
    },

    __createSchema: function (schema) {
        //Set defaults
        schema = _.extend({
            type: 'Text',
            title: this.__createDefaultTitle()
        }, schema);

        //Get the real constructor function i.e. if type is a string such as 'Text'
        schema.type = _.isString(schema.type) ? Form.editors[schema.type] : schema.type;

        return schema;
    },

    __createEditor: function () {
        var ConstructorFn = this.schema.type;
        return new ConstructorFn(_.extend(
            _.pick(this, 'schema', 'form', 'key', 'model', 'value'), {
                id: this.__createEditorId()
            }
        ));
    },

    __createEditorId: function () {
        var prefix = this.idPrefix,
            id = this.key;

        //Replace periods with underscores (e.g. for when using paths)
        id = id.replace(/\./g, '_');

        //If a specific ID prefix is set, use it
        if (_.isString(prefix) || _.isNumber(prefix)) return prefix + id;
        if (_.isNull(prefix)) return id;

        //Otherwise, if there is a model use it's CID to avoid conflicts when multiple forms are on the page
        if (this.model) return this.model.cid + '_' + id;

        return id;
    },

    /*
     * Create the default field title (label text) from the key name.
     * (Converts 'camelCase' to 'Camel Case')
     */
    __createDefaultTitle: function () {
        var str = this.key;
        if (!str) {
            return '';
        }

        //Add spaces
        str = str.replace(/([A-Z])/g, ' $1');

        //Uppercase first character
        str = str.replace(/^./, function(str) { return str.toUpperCase(); });

        return str;
    },

    /**
     * Returns the data to be passed to the template
     *
     * @return {Object}
     */
    templateData: function () {
        var schema = this.schema;

        return {
            help: schema.help || '',
            title: schema.title,
            key: this.key,
            editorId: this.editor.id
        };
    },

    /**
     * Update the model with the new value from the editor
     *
     * @return {Mixed}
     */
    commit: function () {
        return this.editor.commit();
    },

    /**
     * Get the value from the editor
     *
     * @return {Mixed}
     */
    getValue: function () {
        return this.editor.getValue();
    },

    /**
     * Set/change the value of the editor
     *
     * @param {Mixed} value
     */
    setValue: function (value) {
        this.editor.setValue(value);
    },

    /**
     * Give the editor focus
     */
    focus: function () {
        this.editor.focus();
    },

    /**
     * Remove focus from the editor
     */
    blur: function () {
        this.editor.blur();
    },

    /**
     * Remove the field and editor views
     */
    remove: function () {
        this.editor.remove();
        Backbone.View.prototype.remove.call(this);
    }
}, {
    /**
     * CSS class name added to the field when there is a validation error
     */
    errorClassName: 'error',

    template: Handlebars.compile(template)
});
