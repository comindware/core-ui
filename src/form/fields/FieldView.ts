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

const editorSelector = '.js-editor-region';
export default class {
    constructor(options = {}) {
        this.model = options.model;
        options.template = options.template || template;
        this.__createEditor(options);

        if (options.schema.getReadonly || options.schema.getHidden) {
            this.model.on('change', () => this.__updateExternalChange(options));
        }

        if (options.schema.updateEditorEvents) {
            this.model.on(options.schema.updateEditorEvents, this.__updateEditor);
        }

        return this.editor;
    }

    __updateExternalChange(options) {
        if (typeof options.getReadonly === 'function') {
            this.setReadonly(Boolean(options.getReadonly(options.model)));
        }
        if (typeof options.getHidden === 'function') {
            this.setHidden(Boolean(options.getHidden(options.model)));
        }
    }

    __getEditorConstructor(options, editorOptions) {
        if (typeof editorOptions.type === 'function') {
            return editorOptions.type;
        }

        const { template } = options;
        const EditorConstructor = formRepository.editors[editorOptions.type];

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
                    ...editorOptions,
                    editorClasses: typeof editorsClassName === 'function' ? editorsClassName.bind(this) : editorsClassName
                };
            },

            events() {
                const prototypeEvents = EditorConstructor.prototype.events;

                if (!prototypeEvents) {
                    return;
                }

                const events = typeof prototypeEvents === 'function' ? prototypeEvents.call(this) : prototypeEvents;

                Object.keys(events).map(key => {
                    if (key.split(' ').length === 1) {
                        events[`${key} ${editorSelector}`] = events[key];
                        delete events[key];
                    }
                });

                return events;
            },

            onRender() {
                this.domEl = this.el;
                this.$domEl = this.$el;
                this.realEl = this.el = this.el.querySelector(editorSelector);
                this.$realEl = this.$el = Backbone.$(this.el);
                EditorConstructor.prototype.onRender?.apply(this, arguments);
                this.once('render', this.__switchElementsToField);
                this.on('attach', this.__switchElementsToEdtior);
                this.on('before:attach', this.__onBeforeAttach);
            },

            __onBeforeAttach() {
                this.__switchElementsToField();
                if (editorOptions.helpText && !editorOptions.isCell) {
                    const viewModel = new Backbone.Model({
                        helpText: editorOptions.helpText,
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

                    this.helpTextRegion = new Marionette.Region({
                        el: this.el.querySelector('.js-help-text-region')
                    });
                    this.helpTextRegion.show(infoPopout);
                }
            },

            onBeforeDetach() {
                this.__handleRemove();
            },

            onBeforeDestroy() {
                this.__handleRemove();
            },

            onDestroy() {
                EditorConstructor.prototype.onDestroy?.apply(this, arguments);
                this.helpTextRegion?.destroy();
                this.errorsRegion?.destroy();
            },

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

            __onMouseenter() {
                this.$domEl.off(`mouseenter ${editorSelector}`);
                EditorConstructor.prototype.__onMouseenter?.apply(this, arguments);
            },

            __checkUiReady() {
                return this.isRendered() && !this.isDestroyed();
            },

            __handleRemove() {
                this.off('attach', this.__switchElementsToEdtior);
                this.off('before:attach', this.__onBeforeAttach);
                this.__switchElementsToField();
            },

            __switchElementsToField() {
                this.el = this.domEl;
                this.$el = this.$domEl;
            },

            __switchElementsToEdtior() {
                this.el = this.realEl;
                this.$el = this.$realEl;
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

        this.editor = new EditorConstructor(editorOptions);

        this.key = options.key;
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
