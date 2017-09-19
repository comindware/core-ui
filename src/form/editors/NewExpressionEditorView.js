/**
 * Developer: Stanislav Guryev
 * Date: 02.02.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from './impl/newExpressionEditor/templates/newExpression.html';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import DropdownEditor from './DropdownEditorView';
import formRepository from '../formRepository';

const valueTypes = {
    value: 'value',
    context: 'context',
    expression: 'expression',
    script: 'script'
};

const classes = {
    inline: 'dev-expression-editor-field-inline'
};

export default formRepository.editors.NewExpression = BaseLayoutEditorView.extend({
    className: 'new-expression-editor-field',

    options() {
        return {
            showValue: true,
            showContext: true,
            showExpression: true,
            showScript: true,
            enabled: true,
            valueEditor: formRepository.editors.Text,
            valueEditorOptions: {},
            defaultType: valueTypes.value,
            expressionEditorHeight: 300,
            scriptEditorHeight: 300,
            codeEditorMode: 'normal',
            displayInline: false
        };
    },

    regions: {
        typeContainer: '.js-new-expression-type-container',
        valueContainer: '.js-new-expression-value-container',
        contextContainer: '.js-new-expression-context-container',
        scriptContainer: '.js-new-expression-script-container',
        expressionContainer: '.js-new-expression-expression-container'
    },

    ui: {
        type: '.js-new-expression-type-container',
        value: '.js-new-expression-value-container',
        context: '.js-new-expression-context-container',
        script: '.js-new-expression-script-container',
        expression: '.js-new-expression-expression-container'
    },

    template: Handlebars.compile(template),

    templateHelpers() {
        return this.options;
    },

    initialize(options = {}) {
        if (options.schema) {
            _.extend(this.options, _.pick(options.schema, _.keys(this.options)));
        }
        _.extend(this, _.pick(options, 'field'));
        if (_.isString(this.options.valueEditor)) {
            this.options.valueEditor = formRepository.editors[this.options.valueEditor];
        }
        if (!this.value || _.isEmpty(this.value)) {
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
        if (!value || _.isEmpty(this.value)) {
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
                if (_.isArray(this.value.value) && this.value.value.length === 1) {
                    this.valueEditor.setValue(this.value.value[0]);
                } else {
                    this.valueEditor.setValue(this.value.value);
                }
                break;
            case valueTypes.context:
                this.contextEditor.setValue(value.value);
                break;
            case valueTypes.expression:
                this.expressionEditor.setValue(value.value);
                break;
            case valueTypes.script:
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
        this.typeEditor = new DropdownEditor({
            collection: this.valueTypeCollection,
            allowEmptyValue: false
        });
        this.typeEditor.on('change', () => {
            this.__updateEditorValue();
            this.__updateEditorState();
        });

        this.typeEditor.setValue(this.value.type);
        if (this.valueTypeCollection.length === 1) {
            this.ui.type.hide();
        }
        this.typeContainer.show(this.typeEditor);
    },

    __showValueEditor() {
        if (!this.options.showValue) {
            return;
        }
        this.valueTypeCollection.add({
            id: valueTypes.value,
            text: Localizer.get('SUITEGENERAL.FORM.EDITORS.EXPRESSION.VALUE')
        });

        let value = this.value.value;

        if (_.isArray(value) && value.length === 1) {
            value = value[0];
            this.options.valueEditorOptions.displayAttribute = 'name';
        }

        this.valueEditor = new this.options.valueEditor(_.extend(this.options.valueEditorOptions, {
            value: this.value.type === valueTypes.value ? value : null
        }));

        this.valueEditor.on('change', this.__updateEditorValue, this);
        this.valueContainer.show(this.valueEditor);
    },

    __showContextEditor() {
        if (!this.options.showContext) {
            return;
        }

        const contextOptions = _.pick(
            this.options.schema || this.options,
            'recordTypeId', 'context', 'propertyTypes', 'usePropertyTypes', 'popoutFlow', 'allowBlank');

        _.extend(contextOptions, {
            value: this.value.type === valueTypes.context ? this.value.value : null
        });

        this.contextEditor = new formRepository.editors.ContextSelect(contextOptions);
        this.contextEditor.on('change', this.__updateEditorValue, this);
        this.contextContainer.show(this.contextEditor);

        this.valueTypeCollection.add({
            id: valueTypes.context,
            text: Localizer.get('SUITEGENERAL.FORM.EDITORS.EXPRESSION.ATTRIBUTE')
        });
    },

    __showExpressionEditor() {
        if (!this.options.showExpression) {
            return;
        }
        this.valueTypeCollection.add({
            id: valueTypes.expression,
            text: Localizer.get('SUITEGENERAL.FORM.EDITORS.EXPRESSION.EXPRESSION')
        });


        const expressionEditorOptionsOptions = {
            value: this.value.type === valueTypes.expression ? this.value.value : null,
            mode: 'expression',
            height: this.options.expressionEditorHeight,
            showMode: this.options.codeEditorMode
        };

        this.expressionEditor = new formRepository.editors.Code(expressionEditorOptionsOptions);
        this.expressionEditor.on('change', this.__updateEditorValue, this);
        this.expressionContainer.show(this.expressionEditor);
    },

    __showScriptEditor() {
        if (!this.options.showScript) {
            return;
        }
        this.valueTypeCollection.add({
            id: valueTypes.script,
            text: Localizer.get('SUITEGENERAL.FORM.EDITORS.EXPRESSION.CSHARPSCRIPT'),
        });

        const scriptEditorOptionsOptions = {
            value: this.value.type === valueTypes.script ? this.value.value : null,
            mode: 'script',
            height: this.options.scriptEditorHeight,
            showMode: this.options.codeEditorMode
        };

        this.scriptEditor = new formRepository.editors.Code(scriptEditorOptionsOptions);
        this.scriptEditor.on('change', this.__updateEditorValue, this);
        this.scriptContainer.show(this.scriptEditor);
    },

    __updateEditorState() {
        this.ui.value.toggleClass('hidden', this.value.type !== valueTypes.value);
        this.ui.expression.toggleClass('hidden', this.value.type !== valueTypes.expression);
        this.ui.script.toggleClass('hidden', this.value.type !== valueTypes.script);
        this.ui.context.toggleClass('hidden', this.value.type !== valueTypes.context);
    },

    __updateEditorValue() {
        const type = this.typeEditor.getValue();
        let value;
        switch (this.value.type) {
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
            default:
                break;
        }
        this.value = { type, value };
        this.__triggerChange();
    }
});
