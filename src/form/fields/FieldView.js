import template from './templates/field.hbs';
import dropdown from 'dropdown';
import ErrorButtonView from '../../views/ErrorButtonView';
import InfoButtonView from '../../views/InfoButtonView';
import TooltipPanelView from '../../views/TooltipPanelView';
import ErrosPanelView from '../../views/ErrosPanelView';
import formRepository from '../formRepository';

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

        this.$el.parent().parent().addClass(this.classes.ERROR);
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
            this.errorsRegion.show(errorPopout);

            this.isErrorShown = true;
        }
    },

    clearError(): void {
        if (!this.__checkUiReady()) {
            return;
        }
        this.$el.parent().parent().removeClass(this.classes.ERROR);
        this.errorCollection && this.errorCollection.reset();
    },

    __checkUiReady() {
        return this.isRendered() && !this.isDestroyed();
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
        if (typeof this.options.getReadonly === 'function') {
            this.setReadonly(Boolean(this.options.getReadonly(this.model)));
        }
        if (typeof this.options.getHidden === 'function') {
            this.setHidden(Boolean(this.options.getHidden(this.model)));
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
            ...schema,
            form: options.form,
            class: options.class,
            key: options.key,
            model: this.model,
            id: this.__createEditorId(options.key),
            value: options.value,
            fieldId,
            tagName: options.tagName || 'div'
        });

        this.key = options.key;

        this.editor.on('before:attach', () => {
            const fieldTempParts = Handlebars.compile(options.template)(schema);
            this.editor.el.insertAdjacentHTML('beforebegin', fieldTempParts);

            this.editor.el.previousSibling.querySelector('.js-editor-region').insertAdjacentElement('afterbegin', this.editor.el);

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

                this.editor.helpTextRegion = new Marionette.Region({
                    el: this.editor.$el
                        .parent()
                        .parent()
                        .find('.js-help-text-region')
                });
                this.editor.helpTextRegion.show(infoPopout);

                this.editor.once('destroy', () => this.editor.helpTextRegion.destroy());
            }
            this.editor.errorsRegion = new Marionette.Region({
                el: this.editor.$el
                    .parent()
                    .parent()
                    .find('.js-error-text-region')
            });
            this.editor.once('destroy', () => this.editor.errorsRegion.destroy());
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
