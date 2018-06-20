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

        this.context = this.options.context;

        const model = new Backbone.Model({
            instanceTypeId: this.options.recordTypeId,
            context: this.__createTreeCollection(this.context, this.options.recordTypeId),
            propertyTypes: this.options.propertyTypes,
            usePropertyTypes: this.options.usePropertyTypes,
            instanceRecordTypeId: this.options.instanceRecordTypeId,
            allowBlank: this.options.allowBlank
        });

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

        this.context = context;
        panelModel.set('context', this.__createTreeCollection(this.context, recordTypeId));

        if (panelModel.get('instanceTypeId') !== recordTypeId || !this.__isInstanceInContext(this.value)) {
            panelModel.set('instanceTypeId', recordTypeId);
            this.setValue();
        }
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
        this.viewModel.get('button').set('value', this.__getButtonText(this.value));
    },

    __getButtonText(selectedItem) {
        if (!selectedItem || selectedItem === 'False') return '';

        const itemId = selectedItem[selectedItem.length - 1];
        let text = '';

        Object.values(this.context).forEach(value => {
            value.forEach(context => {
                if (context.id === itemId) {
                    text = context.name;
                }
            });
        });

        return text;
    },

    __isInstanceInContext(item) {
        if (!item || item === 'False') return false;
        return Object.values(this.context).find(value => value.find(context => context.id === item[item.length - 1]));
    },

    __applyContext(selected) {
        const newValue = this.__collectPropertyPath(selected);

        this.popoutView.close();
        this.__value(selected.get('id'), true, newValue);
    },

    __createTreeCollection(context, recordTypeId) {
        if (!context || !context[recordTypeId]) {
            return new Backbone.Collection();
        }

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
                        innerEntry.children.forEach(childModel => (childModel.parent = innerEntry));
                    }
                }
                delete innerEntry.id; //todo wtf

                return innerEntry;
            })
        );

        const collection = deepContext[recordTypeId];

        collection.on('expand', model => {
            model.children &&
                model.children.forEach(child => {
                    if (child.get('type') === 'Instance') {
                        const newChild = deepContext[child.get('instanceTypeId')];

                        if (newChild) {
                            child.children = new Backbone.Collection(newChild.toJSON());
                            child.collapsed = true;
                            child.children.forEach(childModel => (childModel.parent = child));
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
