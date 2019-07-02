import template from './templates/field.hbs';
import dropdown from 'dropdown';
import ErrorButtonView from '../../views/ErrorButtonView';
import InfoButtonView from '../../views/InfoButtonView';
import TooltipPanelView from '../../views/TooltipPanelView';
import ErrosPanelView from '../../views/ErrosPanelView';
import formRepository from '../formRepository';
import Backbone from 'backbone';
import _ from 'underscore';
import Marionette from 'backbone.marionette';

const editorFieldExtention = {
    validate(...args) {
        const error = Object.getPrototypeOf(Object.getPrototypeOf(this)).validate.call(this, ...args);

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

        this.el.parentElement.classList.add(...this.classes.ERROR.split(' '));
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

            const el = this.el.parentElement.querySelector('.js-error-text-region');
            this.errorsRegion = new Marionette.Region({ el });

            this.errorsRegion.show(errorPopout);

            this.isErrorShown = true;
        }
    },

    clearError(): void {
        if (!this.__checkUiReady()) {
            return;
        }
        this.el.parentElement.classList.remove(...this.classes.ERROR.split(' '));
        this.errorCollection && this.errorCollection.reset();
    },

    __checkUiReady() {
        return this.isRendered() && !this.isDestroyed();
    }
};

export default class {
    constructor(options = {}) {
        this.model = options.model;
        options.template = options.template || template;
        this.__createEditor(options);

        if (options.schema.getReadonly || options.schema.getHidden) {
            this.model.on('change', this.__updateExternalChange);
        }

        if (options.schema.updateEditorEvents) {
            this.model.on(options.schema.updateEditorEvents, this.__updateEditor);
        }

        return this.editor;
    }

    __updateExternalChange() {
        if (typeof this.options.getReadonly === 'function') {
            this.setReadonly(Boolean(this.options.getReadonly(this.model)));
        }
        if (typeof this.options.getHidden === 'function') {
            this.setHidden(Boolean(this.options.getHidden(this.model)));
        }
    }

    __getEditorConstructor(options, editorOptions) {
        const { template, schema } = options;
        const EditorConstructor = formRepository.editors[options.schema.type];
        const editorTemplateContext = EditorConstructor.prototype.templateContext;

        const editorHTML = function(opt) {
            return EditorConstructor.prototype.template(editorTemplateContext ? editorTemplateContext.call(this, opt) : opt);
        };
        const editorsClassName = EditorConstructor.prototype.className;

        const WrappedEditorConstructor = EditorConstructor.extend({
            template: Handlebars.compile(template),

            templateContext() {
                return {
                    editorHTML: editorHTML.call(this, editorOptions),
                    ...schema,
                    editorClasses: typeof editorsClassName === 'function' ? editorsClassName.bind(this) : editorsClassName
                };
            }
        });

        return WrappedEditorConstructor;
    }

    __createEditor(options) {
        let schemaExtension = {};

        if (_.isFunction(options.schema.schemaExtension)) {
            schemaExtension = options.schema.schemaExtension(this.model);
        }

        const schema = Object.assign({}, options.schema, schemaExtension);
        const editorOptions = {
            ...schema,
            form: options.form,
            key: options.key,
            model: this.model,
            id: this.__createEditorId(options.key),
            value: options.value,
            tagName: options.tagName || 'div'
        };

        options.class ? (editorOptions.class = options.class) : (editorOptions.className = 'form-group');

        const EditorConstructor = this.__getEditorConstructor(options, editorOptions);

        const ExtendedFieldEditorClass = EditorConstructor.extend(editorFieldExtention);

        this.editor = new ExtendedFieldEditorClass(editorOptions);

        this.key = options.key;

        this.editor.on('before:attach', () => {
            if (schema.helpText && !schema.isCell) {
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

                this.editor.helpTextRegion = new Marionette.Region({
                    el: this.editor.el.querySelector('.js-help-text-region')
                });
                this.editor.helpTextRegion.show(infoPopout);

                this.editor.once('destroy', () => this.editor.helpTextRegion.destroy());
            }

            this.editor.once('destroy', () => this.editor.errorsRegion?.destroy());
        });
    }

    __updateEditor() {
        this.__createEditor(this.options);
    }

    __createEditorId(key) {
        if (this.model) {
            return `${this.model.cid}_${key}`;
        }
        return key;
    }
}
