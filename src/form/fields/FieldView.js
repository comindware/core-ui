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
import ErrorButtonView from './views/ErrorButtonView';
import InfoButtonView from './views/InfoButtonView';
import TooltipPanelView from './views/TooltipPanelView';
import formRepository from '../formRepository';

const classes = {
    REQUIRED: 'required',
    READONLY: 'readonly',
    DISABLED: 'disabled',
    ERROR: 'error'
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        options = options || {};

        this.form = options.form;
        this.key = options.key;
        this.__createSchema(options.schema);

        this.__createEditor();

        this.__viewModel = new Backbone.Model({
            helpText: this.schema.helpText,
            errorText: null
        });
    },

    templateHelpers() {
        return {
            title: this.schema.title
        };
    },

    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor-region',
        errorTextRegion: '.js-error-text-region',
        helpTextRegion: '.js-help-text-region'
    },

    onShow() {
        this.editorRegion.show(this.editor);
        const errorPopout = dropdown.factory.createPopout({
            buttonView: ErrorButtonView,
            panelView: TooltipPanelView,
            panelViewOptions: {
                model: this.__viewModel,
                textAttribute: 'errorText'
            },
            popoutFlow: 'right',
            customAnchor: true
        });
        this.errorTextRegion.show(errorPopout);
        if (this.schema.helpText) {
            const infoPopout = dropdown.factory.createPopout({
                buttonView: InfoButtonView,
                panelView: TooltipPanelView,
                panelViewOptions: {
                    model: this.__viewModel,
                    textAttribute: 'helpText'
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
    validate() {
        const error = this.editor.validate();
        if (error) {
            this.setError(error.message);
        } else {
            this.clearError();
        }
        return error;
    },

    setError(msg) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.addClass(classes.ERROR);
        this.__viewModel.set('errorText', msg);
    },

    clearError() {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.removeClass(classes.ERROR);
        this.__viewModel.set('errorText', null);
    },

    /**
     * Update the model with the new value from the editor
     *
     * @return {Mixed}
     */
    commit() {
        return this.editor.commit();
    },

    /**
     * Get the value from the editor
     *
     * @return {Mixed}
     */
    getValue() {
        return this.editor.getValue();
    },

    /**
     * Set/change the value of the editor
     *
     * @param {Mixed} value
     */
    setValue(value) {
        this.editor.setValue(value);
    },

    /**
     * Give the editor focus
     */
    focus() {
        this.editor.focus();
    },

    /**
     * Remove focus from the editor
     */
    blur() {
        this.editor.blur();
    },

    setRequired(required) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.toggleClass(classes.REQUIRED, Boolean(required));
    },

    __updateEditorState(readonly, enabled) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.toggleClass(classes.READONLY, Boolean(readonly));
        this.$el.toggleClass(classes.DISABLED, Boolean(readonly || !enabled));
    },

    __createSchema(schema) {
        // Resolving editor type declared as string
        const type = _.isString(schema.type) ? formRepository.editors[schema.type] : schema.type || 'Text';
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
    __createDefaultTitle() {
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

    __createEditor() {
        const ConstructorFn = this.schema.type;
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

    __createEditorId() {
        if (!this.key) {
            return null;
        }

        let id = this.key;

        //Replace periods with underscores
        id = id.replace(/\./g, '_');
        //Otherwise, if there is a model use it's CID to avoid conflicts when multiple forms are on the page
        if (this.model) {
            return `${this.model.cid}_${id}`;
        }
        return id;
    },

    __checkUiReady() {
        return this.__rendered && !this.isDestroyed;
    }
});
