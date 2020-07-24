import dropdown from 'dropdown';
import { validationSeverityTypes, validationSeverityClasses } from 'Meta';
import template from './templates/field.hbs';
import ErrorButtonView from '../../views/ErrorButtonView';
import InfoButtonView from '../../views/InfoButtonView';
import TooltipPanelView from '../../views/TooltipPanelView';
import ErrorsPanelView from '../../views/ErrorsPanelView';
import formRepository from '../formRepository';

const classes = {
    REQUIRED: 'required',
    READONLY: 'readonly',
    DISABLED: 'disabled'
};

export default Marionette.View.extend({
    initialize(options = {}) {
        this.schema = options.schema;

        this.fieldId = _.uniqueId('field-');

        this.__createEditor(this.options, this.fieldId);

        if (this.schema.getReadonly || this.schema.getHidden) {
            this.listenTo(this.model, 'change', this.__updateExternalChange);
        }

        if (this.schema.updateEditorEvents) {
            this.listenTo(this.model, this.schema.updateEditorEvents, this.__updateEditor);
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
            const viewModel = new Backbone.Model({
                helpText: this.schema.helpText,
                errorText: null
            });

            const infoPopout = dropdown.factory.createPopout({
                buttonView: InfoButtonView,
                panelView: TooltipPanelView,
                panelViewOptions: {
                    model: viewModel,
                    textAttribute: 'helpText'
                },
                popoutFlow: 'right',
                customAnchor: true
            });
            this.showChildView('helpTextRegion', infoPopout);
        }
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

        const isWarning = errors.every(error => error.severity?.toLowerCase() === validationSeverityTypes.WARNING);
        if (isWarning) {
            this.$el.addClass(validationSeverityClasses.WARNING);
            this.$el.removeClass(validationSeverityClasses.ERROR);
        } else {
            this.$el.addClass(validationSeverityClasses.ERROR);
            this.$el.removeClass(validationSeverityClasses.WARNING);
        }
        this.errorCollection ? this.errorCollection.reset(errors) : (this.errorCollection = new Backbone.Collection(errors));
        if (!this.isErrorShown) {
            const errorPopout = dropdown.factory.createPopout({
                buttonView: ErrorButtonView,
                buttonViewOptions: {
                    model: new Backbone.Model({ errorCollection: this.errorCollection })
                },
                panelView: ErrorsPanelView,
                panelViewOptions: {
                    collection: this.errorCollection
                },
                popoutFlow: 'right',
                customAnchor: true
            });
            this.showChildView('errorTextRegion', errorPopout);
            this.isErrorShown = true;
        }
    },

    clearError(): void {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.removeClass(validationSeverityClasses.ERROR);
        this.$el.removeClass(validationSeverityClasses.WARNING);
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

    setRequired(required = this.schema.required) {
        this.schema.required = required;
        this.__updateEmpty();
    },

    __updateEmpty(isEmpty = this.editor?.isEmptyValue()) {
        if (this.schema.required) {
            this.__toggleRequiredClass(isEmpty);
        } else {
            this.__toggleRequiredClass(false);
        }
    },

    __toggleRequiredClass(required) {
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
        if (typeof this.schema.getReadonly === 'function') {
            this.editor.setReadonly(this.schema.getReadonly(this.model));
        }
        if (typeof this.schema.getHidden === 'function') {
            this.editor.setHidden(Boolean(this.schema.getHidden(this.model)));
        }
    },

    __createEditor(options, fieldId) {
        let schemaExtension = {};

        if (_.isFunction(this.schema.schemaExtension)) {
            schemaExtension = this.schema.schemaExtension(this.model);
        }

        this.schema = Object.assign({}, this.schema, schemaExtension);

        const EditorConsturctor = typeof this.schema.type === 'string' ? formRepository.editors[this.schema.type] : this.schema.type;

        this.editor = new EditorConsturctor({
            schema: this.schema,
            form: options.form,
            field: this,
            key: options.key,
            model: this.model,
            id: this.__createEditorId(options.key),
            value: this.options.value,
            fieldId,
            fieldUpdateEmpty: this.__updateEmpty.bind(this)
        });
        this.key = options.key;
        this.editor.on('readonly', readonly => {
            this.__updateEditorState(readonly, this.editor.getEnabled());
        });
        this.editor.on('enabled', enabled => {
            this.__updateEditorState(this.editor.getReadonly(), enabled);
        });
    },

    __updateEditor() {
        this.__createEditor(this.options, this.fieldId);
        this.showChildView('editorRegion', this.editor);
    },

    __createEditorId(key) {
        if (this.model) {
            return `${this.model.cid}_${key}`;
        }
        return key;
    },

    __checkUiReady() {
        return this.isRendered() && !this.isDestroyed();
    }
});
