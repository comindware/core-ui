// @flow
import template from './templates/expressionEditor.html';
import PopupView from './impl/expression/views/PopupView';
import SelectButtonView from './impl/expression/views/SelectButtonView';
import OptionItemCollectionView from './impl/expression/views/OptionItemCollectionView';
import ContextView from './impl/expression/views/ContextView';
import defaultScriptTemplate from './impl/expression/templates/defaultScript.html';
import formRepository from '../formRepository';
import BaseLayoutEditorView from '../editors/base/BaseLayoutEditorView';
import WindowService from '../../services/WindowService';
import dropdownFactory from '../../dropdown/factory';
import LocalizationService from '../../services/LocalizationService';

//Value format: { type: <<value|expression|script>>, value: <<value array or single value|expression text|script text>>}
//Example: { type: 'value', value: 'Some text' }

// used as function because Localization service is not initialized yet
const defaultOptions = () => ({
    showExpression: true,
    defaultExpression: '',
    showScript: true,
    showValue: true,
    showContext: false,
    enabled: true,
    valueEditor: formRepository.editors.Text,
    valueEditorOptions: {},
    emptyText: Localizer.get('CORE.FORM.EDITORS.EXPRESSION.EMPTYTEXT')
});

export default formRepository.editors.Expression = BaseLayoutEditorView.extend({
    template: Handlebars.compile(template),

    regions: {
        valueContainer: '.js-value-container',
        contextContainer: '.js-context-container',
        selectType: '.js-select-type'
    },

    ui: {
        value: '.js-value-container',
        expression: '.js-expression-container',
        script: '.js-script-container',
        context: '.js-context-container'
    },

    events: {
        'click @ui.expression': 'onShowPopup',
        'click @ui.script': 'onShowPopup'
    },

    defaultScriptText: Handlebars.compile(defaultScriptTemplate),

    initialize(options = {}) {
        const defOps = defaultOptions();
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defOps)), defOps);

        if (_.isString(this.options.valueEditor)) {
            this.options.valueEditor = formRepository.editors[this.options.valueEditor];
        }
        if (_.isEmpty(this.value)) {
            this.value = {};
        }
        this.options.valueEditorOptions = Object.assign(this.options.valueEditorOptions, {
            enabled: this.options.enabled
        });
    },

    onShow() {
        this.createOptionCollection();

        this.addValueEditor();
        this.addExpressionEditor();
        this.addScriptEditor();
        this.addContextEditor();

        this.renderValueOptionPopout();

        if (!_.isEmpty(this.value)) {
            this.__showValueType();
            this.__showEditorValue();
        }
    },

    createOptionCollection() {
        this.valueOptionCollection = new Backbone.Collection();
    },

    addValueEditor() {
        if (!this.options.showValue) {
            return;
        }
        const initialValue = this.getValue();
        this.valueOptionCollection.add(new Backbone.Model({
            id: 'value',
            name: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.VALUE'),
            alias: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.VALUEALIAS')
        }));

        this.valueEditor = new this.options.valueEditor(Object.assign(this.options.valueEditorOptions, {
            value: initialValue.type === 'value' ? initialValue.value : null
        }));
        this.valueContainer.show(this.valueEditor);
        this.listenTo(this.valueEditor, 'change', () => this.__updateValue(this.valueEditor.getValue(), true));
    },

    addExpressionEditor() {
        if (!this.options.showExpression) {
            return;
        }
        this.valueOptionCollection.add(new Backbone.Model({
            id: 'expression',
            name: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.EXPRESSION'),
            alias: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.EXPRESSIONALIAS')
        }));
        this.ui.expression.text(this.options.defaultExpression);
        this.ui.expression.data('value', this.options.defaultExpression);
    },

    addScriptEditor() {
        if (!this.options.showScript) {
            return;
        }
        this.valueOptionCollection.add(new Backbone.Model({
            id: 'script',
            name: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.CSHARPSCRIPT'),
            alias: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.CSHARPALIAS')
        }));
        this.ui.script.text(this.defaultScriptText);
        this.ui.script.data('value', this.defaultScriptText);
    },

    addContextEditor() {
        if (!this.options.showContext) {
            return;
        }
        const contextOptions = _.pick(
            this.options.schema || this.options,
            'recordTypeId', 'context', 'propertyTypes', 'usePropertyTypes', 'popoutFlow', 'allowBlank');

        const initialValue = this.getValue();
        Object.assign(contextOptions, {
            value: initialValue.type === 'context' ? initialValue.value : null
        });

        this.contextValueEditor = new ContextView(contextOptions);
        this.contextContainer.show(this.contextValueEditor);

        this.valueOptionCollection.add(new Backbone.Model({
            id: 'context',
            name: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.ATTRIBUTE'),
            alias: LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.ATTRIBUTEALIAS')
        }));

        this.listenTo(this.contextValueEditor, 'change', () => this.__updateValue(this.contextValueEditor.getValue(), true));

        this.ui.script.text(LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.EMPTYTEXT'));
    },

    renderValueOptionPopout() {
        if (this.valueOptionCollection.length === 0) {
            throw new Error('Al least one value option should be specified');
        }
        let selOptionModel;

        if (!_.isEmpty(this.value.type)) {
            selOptionModel = this.valueOptionCollection.findWhere({ id: this.value.type });
        }
        if (!selOptionModel) {
            selOptionModel = this.valueOptionCollection.at(0);
        }

        this.valueOptionCollection.select(selOptionModel);
        this.__updateValueType(selOptionModel.id);

        this.buttonModel = new Backbone.Model({ name: selOptionModel.get('alias') });
        if ((this.valueOptionCollection.length === 1) || (!this.options.enabled)) {
            const buttonView = new SelectButtonView({ model: this.buttonModel });
            this.selectType.show(buttonView);
        } else {
            const popoutOptions = {
                buttonView: SelectButtonView,
                buttonViewOptions: {
                    model: this.buttonModel
                },
                panelView: OptionItemCollectionView,
                panelViewOptions: {
                    collection: this.valueOptionCollection
                },
                popoutFlow: 'left'
            };
            const popoutView = dropdownFactory.createDropdown(popoutOptions);
            this.selectType.show(popoutView);

            this.listenTo(popoutView, 'execute', (id, model) => {
                if (model.id === 'expression' || model.id === 'script') {
                    this.__showPopup(model);
                } else {
                    this.__valueTypeSelected(model);
                }
            });
        }
    },

    updateValueEditor(editor = this.valueEditor) {
        if (Array.isArray(this.value.value) && this.value.value.length === 1) {
            editor.setValue(this.value.value[0]);
        } else {
            editor.setValue(this.value.value);
        }
    },

    updateContextEditor() {
        this.contextValueEditor.setValue(this.value.value);
    },

    updateDefaultEditor() {
        this.ui[this.value.type].toggleClass('empty', _.isEmpty(this.value.value));
        this.ui[this.value.type].text(_.isEmpty(this.value.value)
            ? LocalizationService.get('CORE.FORM.EDITORS.EXPRESSION.EMPTYTEXT')
            : this.value.value);
    },

    __valueTypeSelected(model) {
        this.valueOptionCollection.select(model);
        this.buttonModel.set('name', model.get('alias'));
        this.__updateValueType(model.id, true);
    },

    setValue(value) {
        this.__value(value, false);
    },

    __value(value, triggerChange) {
        if (_.isEqual(this.value, value)) {
            return;
        }
        this.__updateValueType(value.type);
        this.__updateValue(value.value);

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    onShowPopup() {
        this.__showPopup();
    },

    __showPopup(model) {
        if (this.options.enabled) {
            const value = model ? {
                type: model.id,
                value: this.ui[model.id].data('value')
            } : _.clone(this.value);

            const popupView = new PopupView({
                value
            });
            WindowService.showPopup(popupView);

            this.listenToOnce(popupView, 'accept', newValue => {
                if (model) {
                    this.__valueTypeSelected(model);
                }
                this.__updateValue(newValue, true);
            });
        }
    },

    __updateValueType(valueType, triggerChange) {
        if (this.value.type === valueType) {
            return;
        }
        this.value = {
            type: valueType,
            value: this.__getEditorValueByType(valueType)
        };
        this.__showValueType();

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __showValueType() {
        if (!this.el.innerText) { return; }
        this.ui.value.toggleClass('hidden', this.value.type !== 'value');
        this.ui.expression.toggleClass('hidden', this.value.type !== 'expression');
        this.ui.script.toggleClass('hidden', this.value.type !== 'script');
        this.ui.context.toggleClass('hidden', this.value.type !== 'context');

        const valueTypeModel = this.valueOptionCollection.find(f => f.get('id') === this.value.type);
        if (valueTypeModel && this.buttonModel) {
            this.valueOptionCollection.select(valueTypeModel);
            this.buttonModel.set('name', valueTypeModel.get('alias'));
        }
    },

    __updateValue(value, triggerChange) {
        if (this.value.value === value) {
            return;
        }
        this.value = {
            type: this.value.type,
            value
        };
        this.__showEditorValue();

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __getEditorValueByType(editorType) {
        switch (editorType) {
            case 'value':
                return (this.valueEditor && this.valueEditor.getValue()) || null;
            case 'context':
                return (this.contextValueEditor && this.contextValueEditor.getValue()) || null;
            default:
                return null;
        }
    },

    __showEditorValue() {
        if (!this.el.innerText) { return; }
        this.ui[this.value.type].data('value', this.value.value);
        if (this.value.type === 'value') {
            this.updateValueEditor();
        } else if (this.value.type === 'context') {
            this.updateContextEditor();
        } else {
            this.updateDefaultEditor();
        }
    }
});
