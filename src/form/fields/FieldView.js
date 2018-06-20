// @flow
import template from './templates/field.hbs';
import dropdown from 'dropdown';
import ErrorButtonView from './views/ErrorButtonView';
import InfoButtonView from './views/InfoButtonView';
import TooltipPanelView from './views/TooltipPanelView';
import ErrosPanelView from './views/ErrosPanelView';
import formRepository from '../formRepository';

const classes = {
    REQUIRED: 'required',
    READONLY: 'readonly',
    DISABLED: 'disabled',
    ERROR: 'error'
};

export default Marionette.View.extend({
    initialize(options = {}) {
        this.schema = options.schema;

        this.fieldId = _.uniqueId('field-');

        this.__createEditor(options, this.fieldId, _.isString(this.schema.type) ? formRepository.editors[this.schema.type] : this.schema.type);
        if (this.schema.getReadonly || this.schema.getHidden) {
            this.listenTo(this.model, 'change', this.__updateExternalChange);
        }
    },

    templateContext() {
        return {
            title: this.schema.title,
            fieldId: this.fieldId
        };
    },

    template: Handlebars.compile(template),

    regions: {
        editorRegion: {
            el: '.js-editor-region',
            replaceElement: true
        },
        errorTextRegion: '.js-error-text-region',
        helpTextRegion: '.js-help-text-region'
    },

    onRender() {
        this.showChildView('editorRegion', this.editor);
        if (this.schema.helpText) {
            this.__viewModel = new Backbone.Model({
                helpText: this.schema.helpText,
                errorText: null
            });

            const infoPopout = dropdown.factory.createDropdown({
                buttonView: InfoButtonView,
                panelView: TooltipPanelView,
                panelViewOptions: {
                    model: this.__viewModel,
                    textAttribute: 'helpText'
                },
                autoopen: true
            });
            this.showChildView('helpTextRegion', infoPopout);
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
            this.setError([error]);
        } else {
            this.clearError();
        }
        return error;
    },

    setError(errors: Array<any>): void {
        if (!this.__checkUiReady()) {
            return;
        }

        this.$el.addClass(classes.ERROR);
        this.errorCollection ? this.errorCollection.reset(errors) : (this.errorCollection = new Backbone.Collection(errors));
        if (!this.isErrorShown) {
            const errorPopout = dropdown.factory.createDropdown({
                buttonView: ErrorButtonView,
                panelView: ErrosPanelView,
                panelViewOptions: {
                    collection: this.errorCollection
                },
                autoopen: true
            });
            this.showChildView('errorTextRegion', errorPopout);
            this.isErrorShown = true;
        }
    },

    clearError(): void {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.removeClass(classes.ERROR);
        this.errorCollection && this.errorCollection.reset();
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

    __updateExternalChange() {
        if (_.isFunction(this.schema.getReadonly)) {
            this.editor.setReadonly(this.schema.getReadonly(this.model));
        }
        if (_.isFunction(this.schema.getHidden)) {
            this.editor.setHidden(Boolean(this.schema.getHidden(this.model)));
        }
    },

    __createEditor(options, fieldId, ConstructorFn) {
        this.editor = new ConstructorFn({
            schema: this.schema,
            key: options.key,
            model: this.model,
            id: this.__createEditorId(options.key),
            value: this.options.value,
            fieldId
        });
        this.key = options.key;
        this.editor.on('readonly', readonly => {
            this.__updateEditorState(readonly, this.editor.getEnabled());
        });
        this.editor.on('enabled', enabled => {
            this.__updateEditorState(this.editor.getReadonly(), enabled);
        });
    },

    __createEditorId(key) {
        if (this.model) {
            return `${this.model.cid}_${key}`;
        }
        return key;
    },

    __checkUiReady() {
        return this.__rendered && !this.isDestroyed();
    }
});
