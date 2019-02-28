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

const editorFieldExtention = {
    validate(error) {
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
            const errorPopout = dropdown.factory.createPopout({
                buttonView: ErrorButtonView,
                panelView: ErrosPanelView,
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
        this.$el.removeClass(classes.ERROR);
        this.errorCollection && this.errorCollection.reset();
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

    __checkUiReady() {
        return this.isRendered() && !this.isDestroyed();
    },

    __updateEditorState(readonly, enabled) {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.toggleClass(classes.READONLY, Boolean(readonly));
        this.$el.toggleClass(classes.DISABLED, Boolean(readonly || !enabled));
    }
};

export default class {
    constructor(options = {}) {
        this.fieldId = _.uniqueId('field-');
        this.model = options.model;
        options.template = options.template || template;
        this.__createEditor(options, this.fieldId);

        if (options.schema.getReadonly || options.schema.getHidden) {
            this.model.on('change', this.__updateExternalChange);
        }

        if (options.schema.updateEditorEvents) {
            this.model.on(options.schema.updateEditorEvents, this.__updateEditor);
        }

        return this.editor;
    }

    __updateExternalChange() {
        if (typeof this.schema.getReadonly === 'function') {
            this.setReadonly(this.schema.getReadonly(this.model));
        }
        if (typeof this.schema.getHidden === 'function') {
            this.setHidden(Boolean(this.schema.getHidden(this.model)));
        }
    }

    __createEditor(options, fieldId) {
        let schemaExtension = {};

        if (_.isFunction(options.schema.schemaExtension)) {
            schemaExtension = options.schema.schemaExtension(this.model);
        }

        const schema = Object.assign({}, options.schema, schemaExtension);

        const EditorConstructor = formRepository.editors[schema.type];
        const FieldConstructor = EditorConstructor.extend(editorFieldExtention);

        this.editor = new FieldConstructor({
            schema,
            form: options.form,
            class: options.class,
            key: options.key,
            validate() {
                const errors = EditorConstructor.prototype.validate();

                FieldConstructor.prototype.validate(errors);
            },
            model: this.model,
            id: this.__createEditorId(options.key),
            value: options.value,
            fieldId,
            tagName: options.tagName || 'div',
            fieldUpdateEmpty: (...args) => {
                this.editor.__updateEmpty(...args);
            }
        });

        this.key = options.key;
        this.editor.on('readonly', readonly => {
            this.editor.__updateEditorState(readonly, this.editor.getEnabled());
        });
        this.editor.on('enabled', enabled => {
            this.editor.__updateEditorState(this.editor.getReadonly(), enabled);
        });

        this.editor.on('before:attach', () => {
            const fieldTempParts = Handlebars.compile(options.template)(schema).split('<!--js-editor-region -->');

            this.editor.$el.before(fieldTempParts[0]);
            this.editor.$el.after(fieldTempParts[1]);

            if (schema.helpText) {
                const viewModel = new Backbone.Model({
                    helpText: schema.helpText,
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

                this.editor.addRegion('helpTextRegion', {
                    el: this.editor.$el.parent().find('.js-help-text-region')
                });

                this.editor.showChildView('helpTextRegion', infoPopout);
            }

            this.editor.addRegion('errorTextRegion', {
                el: this.editor.$el.parent().find('.js-error-text-region')
            });
            this.editor.__updateEditorState(schema.readonly, schema.enabled);
        });
    }

    __updateEditor() {
        this.__createEditor(this.options, this.fieldId);
        this.showChildView('editorRegion', this.editor);
    }

    __createEditorId(key) {
        if (this.model) {
            return `${this.model.cid}_${key}`;
        }
        return key;
    }
}
