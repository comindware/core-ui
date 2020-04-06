// @flow
import template from './templates/complexEditor.html';
import BaseEditorView from './base/BaseEditorView';
import ContextSelectEditorView from './ContextSelectEditorView';
import CodeEditorView from './CodeEditorView';
import DatalistEditorView from './DatalistEditorView';
import formRepository from '../formRepository';
import { complexValueTypes, getComplexValueTypesLocalization } from '../../Meta';

const classes = {
    inline: 'dev-expression-editor-field-inline',
    base: 'complex-editor-field layout__vertical-layout'
};

const defaultOptions = {
    showValue: true,
    showContext: true,
    showExpression: true,
    showScript: true,
    showTemplate: false,
    enabled: true,
    valueEditor: formRepository.editors.Text,
    valueEditorOptions: {},
    expressionEditorHeight: 300,
    scriptEditorHeight: 300,
    codeEditorMode: 'normal',
    displayInline: false,
    ontologyService: null,
    config: null,
    getTemplate: null,
    hintAttributes: null,
    solution: null
};

export default (formRepository.editors.Complex = BaseEditorView.extend({
    className() {
        return `${classes.base} ${this.options.displayInline ? classes.inline : ''}`;
    },

    regions: {
        typeContainer: '.js-complex-type-container',
        valueContainer: '.js-complex-value-container',
        contextContainer: '.js-complex-context-container',
        scriptContainer: '.js-complex-script-container',
        expressionContainer: '.js-complex-expression-container',
        templateContainer: '.js-complex-template-container'
    },

    ui: {
        type: '.js-complex-type-container',
        value: '.js-complex-value-container',
        context: '.js-complex-context-container',
        script: '.js-complex-script-container',
        expression: '.js-complex-expression-container',
        template: '.js-complex-template-container'
    },

    attributes: {
        tabindex: 0
    },

    template: Handlebars.compile(template),

    templateContext() {
        return this.options;
    },

    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        _.extend(this, _.pick(options, 'field'));
        if (_.isString(this.options.valueEditor)) {
            this.options.valueEditor = formRepository.editors[this.options.valueEditor];
        }
        if (_.isString(this.options.templateEditor)) {
            this.options.templateEditor = formRepository.editors[this.options.templateEditor];
        }
        this.__createValueTypesCollection();
        if (!this.value || !Object.keys(this.value).length) {
            this.value = {
                type: this.valueTypeCollection.at(0).id,
                value: null
            };
        }
        _.defaults(this.options.valueEditorOptions, {
            enabled: this.options.enabled,
            key: this.key
        });

        this.options.showTypeEditor = this.valueTypeCollection.length > 1;
        this.__isFirstValueSetting = true;
    },

    setValue(newValue) {
        let value = newValue;
        if (!value || !Object.keys(this.value).length) {
            value = {
                type: this.valueTypeCollection.at(0).id,
                value: null
            };
        }
        if (!this.__isFirstValueSetting && _.isEqual(this.value, value)) {
            return;
        }
        this.value = value;
        this.__isFirstValueSetting = false;

        this.typeEditor?.setValue(value.type || complexValueTypes.value);
        this.__checkEditorExist(value.type);
        switch (value.type) {
            case complexValueTypes.value:
                if (!this.options.showValue) {
                    return;
                }
                if (!this.valueEditor) {
                    this.__showTypeEditor();
                    return;
                }
                if (Array.isArray(this.value.value) && this.value.value.length === 1 && !(this.valueEditor instanceof formRepository.editors.Datalist)) {
                    this.valueEditor.setValue(this.value.value[0]);
                } else {
                    this.valueEditor.setValue(this.value.value);
                }
                break;
            case complexValueTypes.context:
                if (!this.options.showContext) {
                    return;
                }
                this.contextEditor.setValue(value.value);
                break;
            case complexValueTypes.expression:
                if (!this.options.showExpression) {
                    return;
                }
                this.expressionEditor.setValue(value.value);
                break;
            case complexValueTypes.script:
                if (!this.options.showScript) {
                    return;
                }
                this.scriptEditor.setValue(value.value);
                break;
            case complexValueTypes.template:
                if (!this.options.showTemplate) {
                    return;
                }
                this.templateEditor.setValue(value.value);
                break;
            default:
                break;
        }
    },

    onRender() {
        this.__showTypeEditor();
        this.__updateEditorState();
        if (this.options.displayInline) {
            this.editorEl.classList.add(classes.inline);
        }
    },

    focus() {
        // todo: improve logic
        this.__checkEditorExist(this.value.type);
        switch (this.value.type) {
            case complexValueTypes.value:
                this.valueEditor.focus();
                break;
            case complexValueTypes.context:
                this.contextEditor.focus();
                break;
            case complexValueTypes.expression:
                this.expressionEditor.focus();
                break;
            case complexValueTypes.script:
                this.scriptEditor.focus();
                break;
            case complexValueTypes.template:
                this.templateEditor.focus();
                break;
            default:
                break;
        }
    },

    blur() {
        // todo: improve logic
        this.__checkEditorExist(this.value.type);
        switch (this.value.type) {
            case complexValueTypes.value:
                this.valueEditor.blur();
                break;
            case complexValueTypes.context:
                this.contextEditor.blur();
                break;
            case complexValueTypes.expression:
                this.expressionEditor.blur();
                break;
            case complexValueTypes.script:
                this.scriptEditor.blur();
                break;
            case complexValueTypes.template:
                this.templateEditor.blur();
                break;
            default:
                break;
        }
    },

    isEmptyValue() {
        const value = this.value?.value;
        const isFilled = Array.isArray(value) ? value.length : value;

        return !isFilled;
    },

    __showTypeEditor() {
        if (!this.valueTypeCollection.get(this.value.type)) {
            console.warn(`Unexpected value.type "${this.value.type}"`);
            this.value.type = this.valueTypeCollection.at(0).id;
        }
        if (!this.options.showTypeEditor) {
            return;
        }

        this.typeEditor = new DatalistEditorView({
            collection: this.valueTypeCollection,
            allowEmptyValue: false,
            valueType: 'id',
            showSearch: false
        });
        this.typeEditor.on('change', editor => {
            this.__checkEditorExist(editor.getValue());
            this.__updateEditorValue();
            this.__updateEditorState();
        });

        this.showChildView('typeContainer', this.typeEditor);
        this.typeEditor.setValue(this.value.type);
    },

    __showValueEditor() {
        this.valueEditor = new this.options.valueEditor(this.options.valueEditorOptions);
        this.valueEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('valueContainer', this.valueEditor);
        this.valueEditor.setReadonly(this.readonly);
    },

    __showContextEditor() {
        const contextOptions = _.pick(
            this.options.schema || this.options,
            'recordTypeId',
            'context',
            'contextModel',
            'propertyTypes',
            'usePropertyTypes',
            'popoutFlow',
            'allowBlank',
            'isInstanceExpandable',
            'instanceTypeProperties',
            'instanceValueProperty'
        );

        this.contextEditor = new ContextSelectEditorView(contextOptions);
        this.contextEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('contextContainer', this.contextEditor);
        this.contextEditor.setReadonly(this.readonly);
    },

    __showExpressionEditor() {
        const expressionEditorOptionsOptions = {
            value: this.value.type === complexValueTypes.expression ? this.value.value : null,
            mode: 'expression',
            height: this.options.expressionEditorHeight,
            showMode: this.options.codeEditorMode,
            ontologyService: this.options.ontologyService,
            config: this.options.config,
            getTemplate: this.options.getTemplate,
            templateId: this.options.templateId,
            hintAttributes: this.options.hintAttributes,
            solution: this.options.solution
        };

        this.expressionEditor = new CodeEditorView(expressionEditorOptionsOptions);
        this.expressionEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('expressionContainer', this.expressionEditor);
        this.expressionEditor.setReadonly(this.readonly);
    },

    __showScriptEditor() {
        const scriptEditorOptionsOptions = {
            value: this.value.type === complexValueTypes.script ? this.value.value : null,
            mode: 'script',
            height: this.options.scriptEditorHeight,
            showMode: this.options.codeEditorMode,
            ontologyService: this.options.ontologyService,
            config: this.options.config,
            getTemplate: this.options.getTemplate
        };

        this.scriptEditor = new CodeEditorView(scriptEditorOptionsOptions);
        this.scriptEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('scriptContainer', this.scriptEditor);
        this.scriptEditor.setReadonly(this.readonly);
    },

    __showTemplateEditor() {
        this.templateEditor = new formRepository.editors.Datalist(this.options.templateEditorOptions);
        this.templateEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('templateContainer', this.templateEditor);
        this.templateEditor.setReadonly(this.readonly);
    },

    __updateEditorState() {
        this.ui.value.toggleClass?.('hidden', this.value.type !== complexValueTypes.value);
        this.ui.expression.toggleClass?.('hidden', this.value.type !== complexValueTypes.expression);
        this.ui.script.toggleClass?.('hidden', this.value.type !== complexValueTypes.script);
        this.ui.context.toggleClass?.('hidden', this.value.type !== complexValueTypes.context);
        this.ui.template.toggleClass?.('hidden', this.value.type !== complexValueTypes.template);
    },

    __updateEditorValue() {
        const type = this.typeEditor?.getValue() || this.value.type;
        let value;
        switch (type) {
            case complexValueTypes.value:
                value = this.valueEditor.getValue();
                break;
            case complexValueTypes.context:
                value = this.contextEditor.getValue();
                break;
            case complexValueTypes.expression:
                value = this.expressionEditor ? this.expressionEditor.getValue() : null;
                break;
            case complexValueTypes.script:
                value = this.scriptEditor ? this.scriptEditor.getValue() : null;
                break;
            case complexValueTypes.template:
                value = this.templateEditor.getValue();
                break;
            default:
                break;
        }
        this.value = { type, value };
        this.__triggerChange(this.value);
    },

    __setReadonly(readonly) {
        BaseEditorView.prototype.__setReadonly.call(this, readonly);

        if (this.typeEditor) {
            this.typeEditor.setReadonly(readonly);
            if (this.isRendered() && !this.isDestroyed()) {
                this.ui.type.toggle(!readonly);
            }
        }
        switch (this.value && this.value.type) {
            case complexValueTypes.value:
                this.valueEditor?.setReadonly(readonly);
                break;
            case complexValueTypes.context:
                this.contextEditor?.setReadonly(readonly);
                break;
            case complexValueTypes.expression:
                this.expressionEditor?.setReadonly(readonly);
                break;
            case complexValueTypes.script:
                this.scriptEditor?.setReadonly(readonly);
                break;
            case complexValueTypes.template:
                this.templateEditor?.setReadonly(readonly);
                break;
            default:
                break;
        }
    },

    __checkEditorExist(valueType) {
        switch (valueType) {
            case complexValueTypes.value:
                if (!this.valueEditor && this.options.showValue) {
                    this.__showValueEditor();
                }
                break;
            case complexValueTypes.context:
                if (!this.contextEditor && this.options.showContext) {
                    this.__showContextEditor();
                }
                break;
            case complexValueTypes.expression:
                if (!this.expressionEditor && this.options.showExpression) {
                    this.__showExpressionEditor();
                }
                break;
            case complexValueTypes.script:
                if (!this.scriptEditor && this.options.showScript) {
                    this.__showScriptEditor();
                }
                break;
            case complexValueTypes.template:
                if (!this.templateEditor && this.options.showTemplate) {
                    this.__showTemplateEditor();
                }
                break;
            default:
                break;
        }
    },

    __createValueTypesCollection() {
        this.valueTypeCollection = new Backbone.Collection(null, { comparator: false });
        const { showValue, showContext, showExpression, showScript, showTemplate } = this.options;
        if (showValue) {
            this.valueTypeCollection.add({
                id: complexValueTypes.value,
                text: getComplexValueTypesLocalization(complexValueTypes.value)
            });
        }
        if (showContext) {
            this.valueTypeCollection.add({
                id: complexValueTypes.context,
                text: getComplexValueTypesLocalization(complexValueTypes.context)
            });
        }
        if (showExpression) {
            this.valueTypeCollection.add({
                id: complexValueTypes.expression,
                text: getComplexValueTypesLocalization(complexValueTypes.expression)
            });
        }
        if (showScript) {
            this.valueTypeCollection.add({
                id: complexValueTypes.script,
                text: getComplexValueTypesLocalization(complexValueTypes.script)
            });
        }
        if (showTemplate) {
            this.valueTypeCollection.add({
                id: complexValueTypes.template,
                text: getComplexValueTypesLocalization(complexValueTypes.template)
            });
        }
        if (this.valueTypeCollection.length === 0) {
            throw new Error('Al least one value option should be specified');
        }
    }
}));
