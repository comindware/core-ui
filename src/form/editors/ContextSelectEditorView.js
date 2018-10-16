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
    contextModel: undefined,
    propertyTypes: undefined,
    usePropertyTypes: true,
    allowBlank: false,
    instanceRecordTypeId: undefined
};

export default (formRepository.editors.ContextSelect = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        if (this.options.contextModel) {
            this.listenTo(this.options.contextModel, 'change:items', (model, value) => this.__onContextChange(value));
            this.context = this.options.contextModel.get('items');
        } else {
            this.context = this.options.context;
        }

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

        this.__updateDisplayValue();
    },

    ui: {
        clearButton: '.js-clear-button'
    },

    attributes: {
        tabindex: 0
    },

    regions: {
        contextPopoutRegion: '.js-context-popout-region'
    },

    template: Handlebars.compile(template),

    className: 'editor context_select dropdown_root',

    events: {
        'click @ui.clearButton': '__clear'
    },

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
                maxWidth: 390,
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

        panelModel.set('instanceTypeId', recordTypeId);

        if (this.__isInstanceInContext(this.value)) {
            this.__updateDisplayValue();
        } else {
            this.setValue();
        }

        this.render();
    },

    __value(value, triggerChange, newValue) {
        this.value = newValue || value;

        if (triggerChange) {
            this.__triggerChange();
        }

        this.__updateDisplayValue();
    },

    __getButtonText(selectedItem) {
        if (!selectedItem || selectedItem === 'False') return '';
        let instanceTypeId = this.viewModel.get('panel').get('instanceTypeId');
        let text = '';

        selectedItem.forEach((item, index) => {
            const searchItem = this.context[instanceTypeId]?.find(contextItem => contextItem.id === item);

            if (searchItem) {
                text += index ? ` - ${searchItem.name}` : searchItem.name;
                instanceTypeId = searchItem.instanceTypeId;
            }
        });

        return text;
    },

    __isInstanceInContext(item) {
        if (!item || item === 'False') return false;

        return Object.values(this.context).find(value => value.find(context => context.id === item[item.length - 1]));
    },

    __applyContext(selected) {
        const propertyTypes = this.options.propertyTypes;
        if (this.options.usePropertyTypes && propertyTypes && propertyTypes.length && !propertyTypes.includes(selected.get('type'))) {
            return;
        }
        const newValue = this.__collectPropertyPath(selected);

        this.popoutView.close();
        this.__value(selected.id, true, newValue);
    },

    __onContextChange(newData) {
        this.context = newData;
        this.updateContext(this.options.recordTypeId, newData);
    },

    __createTreeCollection(context, recordTypeId) {
        if (!context || !context[recordTypeId]) {
            return new Backbone.Collection();
        }

        const deepContext = _.cloneDeep(context);
        const propertyTypes = this.options.propertyTypes;

        Object.keys(deepContext).forEach(key => {
            let items = deepContext[key];
            if (this.options.usePropertyTypes && propertyTypes && propertyTypes.length) {
                items = items.filter(item => propertyTypes.includes(item.type) || item.type === 'Instance');
            }
            deepContext[key] = new Backbone.Collection(items);
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
        collectedPath.unshift(selectedModel.get('id'));

        if (selectedModel.parent) {
            return this.__collectPropertyPath(selectedModel.parent, collectedPath);
        }

        return collectedPath;
    },

    __updateDisplayValue() {
        this.viewModel.get('button').set('value', this.__getButtonText(this.value));
    },

    __clear() {
        this.__value(null, true, null);
        return false;
    }
}));
