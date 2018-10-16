// @flow
import template from './impl/newExpressionEditor/templates/newExpression.html';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DatalistEditorView from './DatalistEditorView';
import formRepository from '../formRepository';
import LocalizationService from '../../services/LocalizationService';

const valueTypes = {
    value: 'value',
    context: 'context',
    expression: 'expression',
    script: 'script',
    template: 'template'
};

const classes = {
    inline: 'dev-expression-editor-field-inline'
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
    defaultType: valueTypes.value,
    expressionEditorHeight: 300,
    scriptEditorHeight: 300,
    codeEditorMode: 'normal',
    displayInline: false,
    ontologyService: null
};

export default (formRepository.editors.NewExpression = BaseLayoutEditorView.extend({
    className: 'new-expression-editor-field layout__vertical-layout',

    regions: {
        typeContainer: '.js-new-expression-type-container',
        valueContainer: '.js-new-expression-value-container',
        contextContainer: '.js-new-expression-context-container',
        scriptContainer: '.js-new-expression-script-container',
        expressionContainer: '.js-new-expression-expression-container',
        templateContainer: '.js-new-expression-template-container'
    },

    ui: {
        type: '.js-new-expression-type-container',
        value: '.js-new-expression-value-container',
        context: '.js-new-expression-context-container',
        script: '.js-new-expression-script-container',
        expression: '.js-new-expression-expression-container',
        template: '.js-new-expression-template-container'
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
        if (!this.value || !Object.keys(this.value).length) {
            this.value = {
                type: this.options.defaultType,
                value: null
            };
        }
        this.options.valueEditorOptions = _.extend(this.options.valueEditorOptions, {
            enabled: this.options.enabled
        });
    },

    setValue(oldValue) {
        let value = oldValue;
        if (!value || !Object.keys(this.value).length) {
            value = {
                type: this.options.defaultType,
                value: null
            };
        }

        if (_.isEqual(this.value, value)) {
            return;
        }
        this.typeEditor.setValue(value.type || valueTypes.value);
        switch (value.type) {
            case valueTypes.value:
                if (!this.valueEditor) {
                    return;
                }
                if (Array.isArray(this.value.value) && this.value.value.length === 1) {
                    this.valueEditor.setValue(this.value.value[0]);
                } else {
                    this.valueEditor.setValue(this.value.value);
                }
                break;
            case valueTypes.context:
                if (!this.contextEditor) {
                    return;
                }
                this.contextEditor.setValue(value.value);
                break;
            case valueTypes.expression:
                if (!this.expressionEditor) {
                    return;
                }
                this.expressionEditor.setValue(value.value);
                break;
            case valueTypes.script:
                if (!this.scriptEditor) {
                    return;
                }
                this.scriptEditor.setValue(value.value);
                break;
            default:
                break;
        }
    },

    onRender() {
        this.valueTypeCollection = new Backbone.Collection(null, { comparator: false });
        this.__showValueEditor();
        this.__showContextEditor();
        this.__showExpressionEditor();
        this.__showScriptEditor();
        this.__showTemplateEditor();
        this.__showTypeEditor();
        this.__updateEditorState();
        if (this.options.displayInline) {
            this.$el.addClass(classes.inline);
        }
    },

    __showTypeEditor() {
        if (this.valueTypeCollection.length === 0) {
            throw new Error('Al least one value option should be specified');
        }
        if (!this.valueTypeCollection.get(this.value.type)) {
            this.value.type = this.valueTypeCollection.at(0).id;
        }
        this.typeEditor = new DatalistEditorView({
            collection: this.valueTypeCollection,
            allowEmptyValue: false,
            valueType: 'id'
        });
        this.typeEditor.on('change', () => {
            this.__updateEditorValue();
            this.__updateEditorState();
        });

        if (this.valueTypeCollection.length === 1) {
            this.ui.type.hide();
        }
        this.showChildView('typeContainer', this.typeEditor);
        this.typeEditor.setValue(this.value.type);
    },

    __showValueEditor() {
        if (!this.options.showValue) {
            return;
        }
        this.valueTypeCollection.add({
            id: valueTypes.value,
            text: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.VALUE')
        });

        const value = this.value.value;

        this.valueEditor = new this.options.valueEditor(
            _.extend(this.options.valueEditorOptions, {
                value: this.value.type === valueTypes.value ? value : null
            })
        );

        this.valueEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('valueContainer', this.valueEditor);
    },

    __showContextEditor() {
        if (!this.options.showContext) {
            return;
        }

        const contextOptions = _.pick(this.options.schema || this.options, 'recordTypeId', 'context', 'contextModel', 'propertyTypes', 'usePropertyTypes', 'popoutFlow', 'allowBlank');

        _.extend(contextOptions, {
            value: this.value.type === valueTypes.context ? this.value.value : null
        });

        this.contextEditor = new formRepository.editors.ContextSelect(contextOptions);
        this.contextEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('contextContainer', this.contextEditor);

        this.valueTypeCollection.add({
            id: valueTypes.context,
            text: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.ATTRIBUTE')
        });
    },

    __showExpressionEditor() {
        if (!this.options.showExpression) {
            return;
        }
        this.valueTypeCollection.add({
            id: valueTypes.expression,
            text: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.EXPRESSION')
        });

        const expressionEditorOptionsOptions = {
            value: this.value.type === valueTypes.expression ? this.value.value : null,
            mode: 'expression',
            height: this.options.expressionEditorHeight,
            showMode: this.options.codeEditorMode,
            ontologyService: this.options.ontologyService
        };

        this.expressionEditor = new formRepository.editors.Code(expressionEditorOptionsOptions);
        this.expressionEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('expressionContainer', this.expressionEditor);
    },

    __showScriptEditor() {
        if (!this.options.showScript) {
            return;
        }
        this.valueTypeCollection.add({
            id: valueTypes.script,
            text: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.CSHARPSCRIPT')
        });

        const scriptEditorOptionsOptions = {
            value: this.value.type === valueTypes.script ? this.value.value : null,
            mode: 'script',
            height: this.options.scriptEditorHeight,
            showMode: this.options.codeEditorMode,
            ontologyService: this.options.ontologyService
        };

        this.scriptEditor = new formRepository.editors.Code(scriptEditorOptionsOptions);
        this.scriptEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('scriptContainer', this.scriptEditor);
    },

    __showTemplateEditor() {
        if (!this.options.showTemplate) {
            return;
        }
        this.valueTypeCollection.add({
            id: valueTypes.template,
            text: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.TEMPLATE')
        });

        const value = this.value.value;

        this.templateEditor = new this.options.templateEditor(
            _.extend(this.options.templateEditorOptions, {
                value: this.value.type === valueTypes.template ? value : null
            })
        );

        this.templateEditor.on('change', this.__updateEditorValue, this);
        this.showChildView('templateContainer', this.templateEditor);
    },

    __updateEditorState() {
        this.ui.value.toggleClass('hidden', this.value.type !== valueTypes.value);
        this.ui.expression.toggleClass('hidden', this.value.type !== valueTypes.expression);
        this.ui.script.toggleClass('hidden', this.value.type !== valueTypes.script);
        this.ui.context.toggleClass('hidden', this.value.type !== valueTypes.context);
        this.ui.template.toggleClass('hidden', this.value.type !== valueTypes.template);
    },

    __updateEditorValue() {
        const type = this.typeEditor.getValue();
        let value;
        switch (type) {
            case valueTypes.value:
                value = this.valueEditor.getValue();
                break;
            case valueTypes.context:
                value = this.contextEditor.getValue();
                break;
            case valueTypes.expression:
                value = this.expressionEditor ? this.expressionEditor.getValue() : null;
                break;
            case valueTypes.script:
                value = this.scriptEditor ? this.scriptEditor.getValue() : null;
                break;
            case valueTypes.template:
                value = this.templateEditor.getValue();
                break;
            default:
                break;
        }
        this.value = { type, value };
        this.__triggerChange();
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);

        this.typeEditor.setReadonly(readonly);
        switch (this.value && this.value.type) {
            case valueTypes.value:
                this.valueEditor.setReadonly(readonly);
                break;
            case valueTypes.context:
                this.contextEditor.setReadonly(readonly);
                break;
            case valueTypes.expression:
                this.expressionEditor.setReadonly(readonly);
                break;
            case valueTypes.script:
                this.scriptEditor.setReadonly(readonly);
                break;
            case valueTypes.template:
                this.templateEditor.setReadonly(readonly);
                break;
            default:
                break;
        }
    }
}));
