// @flow
import template from './templates/contextSelectEditor.html';
import PopoutButtonView from './impl/context/views/PopoutButtonView';
import PopoutWrapperView from './impl/context/views/PopoutWrapperView';
import formRepository from '../formRepository';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import dropdownFactory from '../../dropdown/factory';

const defaultOptions = {
    recordTypeId: undefined,
    context: undefined,
    propertyTypes: undefined,
    usePropertyTypes: true,
    allowBlank: false,
    instanceRecordTypeId: undefined
};

export default (formRepository.editors.ContextSelect = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        const model = new Backbone.Model({
            instanceTypeId: this.options.recordTypeId,
            context: this.options.context,
            propertyTypes: this.options.propertyTypes,
            usePropertyTypes: this.options.usePropertyTypes,
            instanceRecordTypeId: this.options.instanceRecordTypeId,
            allowBlank: this.options.allowBlank
        });

        model.set({ context: this.__createTreeCollection(this.options.context, this.options.recordTypeId) });

        this.viewModel = new Backbone.Model({
            button: new Backbone.Model(),
            panel: model
        });

        const buttonValue = this.__getButtonText(this.getValue());
        this.viewModel.get('button').set('value', buttonValue);
    },

    focusElement: null,

    attributes: {
        tabindex: 0
    },

    regions: {
        contextPopoutRegion: '.js-context-popout-region'
    },

    template: Handlebars.compile(template),

    className: 'editor context_select',

    onRender() {
        if (!this.enabled) {
            this.contextPopoutRegion.show(
                new PopoutButtonView({
                    model: this.viewModel.get('button')
                })
            );
            return;
        }

        this.popoutView = dropdownFactory.createDropdown({
            panelView: PopoutWrapperView,
            panelViewOptions: {
                model: this.viewModel.get('panel')
            },
            buttonView: PopoutButtonView,
            buttonViewOptions: {
                model: this.viewModel.get('button')
            },
            autoOpen: true
        });

        this.showChildView('contextPopoutRegion', this.popoutView);

        this.listenTo(this.popoutView, 'panel:context:selected', this.__applyContext);
    },

    setValue(value) {
        this.__value(value, false);
    },

    updateContext(recordTypeId, context) {
        const panelModel = this.viewModel.get('panel');
        panelModel.set('instanceTypeId', recordTypeId);
        panelModel.set('context', this.__createTreeCollection(context, recordTypeId));
        this.setValue();
        this.render();
    },

    __value(value, triggerChange, newValue) {
        if (this.value === value) {
            return;
        }
        this.value = newValue || value;
        if (triggerChange) {
            this.__triggerChange();
        }
        this.viewModel.get('button').set('value', this.__getButtonText(value));
    },

    __getButtonText(selectedItem) {
        const panelModel = this.viewModel.get('panel');
        if (!selectedItem || selectedItem === 'False') return '';
        let instanceTypeId = panelModel.get('instanceTypeId');

        let text = '';

        this.options.context[instanceTypeId].forEach(context => {
            if (context.id === selectedItem) {
                text = context.name;
                instanceTypeId = context.instanceTypeId;
                return false;
            }
        });

        return text;
    },

    __applyContext(selected) {
        const newValue = this.__collectPropertyPath(selected);

        this.popoutView.close();
        this.__value(selected.get('id'), true, newValue);
    },

    __createTreeCollection(context, recordTypeId) {
        const deepContext = _.cloneDeep(context);

        Object.keys(deepContext).forEach(key => {
            deepContext[key] = new Backbone.Collection(deepContext[key]);
        });

        Object.values(deepContext).forEach(entry =>
            entry.forEach(innerEntry => {
                if (innerEntry.get('type') === 'Instance') {
                    const model = deepContext[innerEntry.get('instanceTypeId')];
                    if (model) {
                        innerEntry.children = new Backbone.Collection(model.toJSON());
                        innerEntry.collapsed = true;
                        innerEntry.children.forEach(childModel => childModel.parent = innerEntry);
                    }
                }
                delete innerEntry.id; //todo wtf

                return innerEntry;
            })
        );

        const collection = deepContext[recordTypeId];

        collection.on('expand', model => {
            model.children && model.children.forEach(child => {
                if (child.get('type') === 'Instance') {
                    const newChild = deepContext[child.get('instanceTypeId')];

                    if (newChild) {
                        child.children = new Backbone.Collection(newChild.toJSON());
                        child.collapsed = true;
                        child.children.forEach(childModel => childModel.parent = child);
                    }
                }
            });
        });

        return collection;
    },

    __collectPropertyPath(selectedModel, collectedPath = []) {
        collectedPath.push(selectedModel.get('id'));

        if (selectedModel.parent) {
            return this.__collectPropertyPath(selectedModel.parent, collectedPath);
        }

        return collectedPath;
    },

    isEmptyValue() {
        return false;
    }
}));
