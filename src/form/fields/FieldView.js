/**
 * Developer: Stepan Burguchev
 * Date: 1/26/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import template from './templates/field.hbs';
import { Handlebars } from 'lib';
import dropdown from 'dropdown';
import FieldInfoModel from './models/FieldInfoModel';
import InfoButtonView from './views/InfoButtonView';
import InfoMessageView from './views/InfoMessageView';
import formRepository from '../formRepository';

const classes = {
    REQUIRED: 'required',
    READONLY: 'readonly',
    DISABLED: 'disabled',
    ERROR: 'error'
};

export default Marionette.LayoutView.extend({
    initialize (options) {
        options = options || {};

        this.form = options.form;
        this.key = options.key;
        this.__createSchema(options.schema);

        this.__createEditor();
    },

    templateHelpers () {
        return {
            help: this.schema.help || '',
            title: this.schema.title,
            key: this.key,
            editorId: this.editor.id
        };
    },

    template: Handlebars.compile(template),

    ui: {
        errorText: '.js-error-text'
    },

    regions: {
        editorRegion: '.js-editor-region',
        helpTextRegion: '.js-help-text-region'
    },

    onShow () {
        this.editorRegion.show(this.editor);
        if (this.schema.helpText) {
            this.fieldInfoModel = new FieldInfoModel({
                text: this.schema.helpText
            });
            let infoPopout = dropdown.factory.createPopout({
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
            this.helpTextRegion.show(infoPopout);
        }
        this.__rendered = true;
        this.setRequired(this.schema.required);
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
    },

    /**
     * Check the validity of the field
     *
     * @return {String}
     */
    validate () {
        let error = this.editor.validate();
        if (error) {
            this.setError(error.message);
        } else {
            this.clearError();
        }
        return error;
    },

    setError (msg) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.addClass(classes.ERROR);
        this.ui.errorText.text(msg);
    },

    clearError () {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.removeClass(classes.ERROR);
        this.ui.errorText.text('');
    },

    /**
     * Update the model with the new value from the editor
     *
     * @return {Mixed}
     */
    commit () {
        return this.editor.commit();
    },

    /**
     * Get the value from the editor
     *
     * @return {Mixed}
     */
    getValue () {
        return this.editor.getValue();
    },

    /**
     * Set/change the value of the editor
     *
     * @param {Mixed} value
     */
    setValue (value) {
        this.editor.setValue(value);
    },

    /**
     * Give the editor focus
     */
    focus () {
        this.editor.focus();
    },

    /**
     * Remove focus from the editor
     */
    blur () {
        this.editor.blur();
    },

    setRequired (required) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.toggleClass(classes.REQUIRED, Boolean(required));
    },

    __updateEditorState (readonly, enabled) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.toggleClass(classes.READONLY, Boolean(readonly));
        this.$el.toggleClass(classes.DISABLED, Boolean(readonly || !enabled));
    },

    __createSchema (schema) {
        // Resolving editor type declared as string
        let type = _.isString(schema.type) ? formRepository.editors[schema.type] : schema.type || 'Text';
        this.schema = Object.assign({
            title: this.__createDefaultTitle(),
            required: false
        }, schema);
        this.schema.type = type;
    },

    /*
     * Create the default field title (label text) from the key name.
     * (Converts 'camelCase' to 'Camel Case')
     */
    __createDefaultTitle () {
        let str = this.key;
        if (!str) {
            return '';
        }

        //Add spaces
        str = str.replace(/([A-Z])/g, ' $1');
        //Uppercase first character
        str = str.replace(/^./, x => x.toUpperCase());
        return str;
    },

    __createEditor () {
        let ConstructorFn = this.schema.type;
        this.editor = new ConstructorFn({
            schema: this.schema,
            form: this.form,
            field: this,
            key: this.key,
            model: this.model,
            id: this.__createEditorId(),
            value: this.options.value
        });
        this.editor.on('readonly', readonly => {
            this.__updateEditorState(readonly, this.editor.getEnabled());
        });
        this.editor.on('enabled', enabled => {
            this.__updateEditorState(this.editor.getReadonly(), enabled);
        });
    },

    __createEditorId () {
        let id = this.key;

        //Replace periods with underscores
        id = id.replace(/\./g, '_');
        //Otherwise, if there is a model use it's CID to avoid conflicts when multiple forms are on the page
        if (this.model) {
            return `${this.model.cid}_${id}`;
        }
        return id;
    },

    __checkUiReady () {
        return this.__rendered && !this.isDestroyed;
    }
});
