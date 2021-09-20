// @flow
import template from './templates/contextSelectEditor.html';
import PopoutButtonView from './impl/context/views/PopoutButtonView';
import PopoutWrapperView from './impl/context/views/PopoutWrapperView';
import formRepository from '../formRepository';
import BaseEditorView from './base/BaseEditorView';
import dropdownFactory from '../../dropdown/factory';
import { objectPropertyTypes } from '../../Meta';
import DatalistEditorView from './DatalistEditorView';
import BaseCollectionEditorView from './base/BaseCollectionEditorView';

const defaultOptions = () => ({
    recordTypeId: undefined,
    emptyPlaceholder: Localizer.get('CORE.COMMON.NOTSET'),
    context: undefined,
    contextModel: undefined,
    propertyTypes: undefined,
    usePropertyTypes: true,
    allowBlank: false,
    instanceRecordTypeId: undefined,
    isInstanceExpandable: true,
    instanceTypeProperties: [objectPropertyTypes.INSTANCE],
    instanceValueProperty: 'instanceTypeId'
});

export default formRepository.editors.ContextSelect = BaseCollectionEditorView.extend({
    initialize(options = {}) {
        // BaseCollectionEditorView.prototype.initialize.apply(this, arguments);
        this.__applyOptions(options, defaultOptions);
        this.collection = new Backbone.Collection();
        this.listenTo(this.collection, 'change', this.__onCollectionChange);
        this.recordTypeId = options.recordTypeId;

        if (this.options.contextModel) {
            this.listenTo(this.options.contextModel, 'change:items', (model, value) => this.__onContextChange(value));
            this.context = this.options.contextModel.get('items');
        } else {
            this.context = this.options.context;
        }

        const model = new Backbone.Model({
            instanceTypeId: this.recordTypeId,
            propertyTypes: this.options.propertyTypes,
            usePropertyTypes: this.options.usePropertyTypes,
            instanceRecordTypeId: this.options.instanceRecordTypeId,
            allowBlank: this.options.allowBlank
        });

        this.viewModel = new Backbone.Model({
            button: new Backbone.Model({
                // placeholder: this.__placeholderShouldBe()
            }),
            panel: model
        });

        this.__updateDisplayValue();
    },

    ui: {
        clearButton: '.js-clear-button'
    },

    childView: DatalistEditorView,

    regions: {
        dropdownRegion: '.js-context-popout-region'
    },

    template: Handlebars.compile(template),

    className: 'editor context_select',

    events: {
        'click @ui.clearButton': '__onClearClickHandler',
        'dblclick @ui.clearButton': '__onClearDblclick'
    },

    // onRender() {
    //     if (!this.enabled) {
    //         this.contextPopoutRegion.show(
    //             new PopoutButtonView({
    //                 model: this.viewModel.get('button')
    //             })
    //         );
    //         return;
    //     }
    //
    //     this.popoutView = dropdownFactory.createDropdown({
    //         panelView: PopoutWrapperView,
    //         panelViewOptions: {
    //             maxWidth: 390,
    //             model: this.viewModel.get('panel')
    //         },
    //         buttonView: PopoutButtonView,
    //         buttonViewOptions: {
    //             model: this.viewModel.get('button')
    //         },
    //         autoOpen: false
    //     });
    //
    //     this.showChildView('contextPopoutRegion', this.popoutView);
    //
    //     this.listenTo(this.popoutView, 'panel:context:selected', this.__applyContext);
    //     this.listenTo(this.popoutView, 'before:open', this.__onBeforeOpen);
    //     this.listenTo(this.popoutView, 'click', this.__onButtonClick);
    // },

    getPropertiesCollection() {
        return this.collection;
    },

    setPermissions(enabled, readonly) {
        BaseCollectionEditorView.prototype.setPermissions.call(this, enabled, readonly);
        // this.viewModel.get('button').set('placeholder', this.__placeholderShouldBe());
    },

    setValue(value) {
        this.__value(value, false, true);
    },

    updateContext(recordTypeId, context) {
        const panelModel = this.viewModel.get('panel');

        this.context = context;
        this.recordTypeId = recordTypeId;

        if (!this.__isInstanceInContext(this.value)) {
            this.setValue();
        }
    },

    // onFocus() {
    //     BaseEditorView.prototype.onFocus.apply(this, arguments);
    //     if (this.getReadonly()) {
    //         return;
    //     }
    //     this.popoutView.open();
    // },

    childViewContainer: '.js-child-view-container',

    childViewOptions(model) {
        const index = this.collection.indexOf(model);
        const recordTypeId = index === 0 ? this.recordTypeId : this.collection.at(index - 1).get(this.options.instanceValueProperty);
        return {
            ...this.options,
            key: 'id',
            valueType: 'id',
            // idAttribute: 'alias',
            autocommit: true,
            allowEmptyValue: false,
            emptyPlaceholder: '…',
            showAdditionalList: true,
            iconProperty: 'type',
            subtextProperty: 'alias',
            model,
            popoutFlow: 'right',
            panelClass: 'datalist-panel-default-focus',
            alwaysAlignByButton: false,
            collection: this.context[recordTypeId]?.filter(property => this.__isPropertyValid(property))
        };
    },

    __value(value, triggerChange, updateUi) {
        this.value = value;

        let recordTypeId = this.recordTypeId;
        if (value) {
            this.collection.set(value?.map(v => {
                const property = this.context[recordTypeId]?.find(p => p.id === v || p.alias === v);
                if (!property) {
                    return {};
                }
                recordTypeId = property[this.options.instanceValueProperty];
                return property;
            }) || [], { remove: true });
        } else {
            this.collection.reset();
        }
        if (triggerChange) {
            this.__triggerChange();
        }

        if (!this.collection.length || this.options.instanceTypeProperties.includes(this.collection.last().get('type'))) {
            this.collection.add({});
            this.children.last().focus();
        }
        this.__updateDisplayValue();
    },

    __onCollectionChange() {
        const value = this.collection.reduce((acc, model) => {
            if (model.id) {
                acc.push(model.id);
            }
            return acc;
        }, []);
        this.__value(value, true, false);
    },

    __getButtonText(value) {
        if (!value || value === 'False') {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }

        if (!Array.isArray(value)) {
            return '';
        }

        let instanceTypeId = this.recordTypeId;
        let text = '';

        value.forEach((item, index) => {
            const searchItem = this.context[instanceTypeId]?.find(contextItem => contextItem.id === item || contextItem.alias === item);

            if (searchItem) {
                text += index ? ` - ${searchItem.name}` : searchItem.name;
                instanceTypeId = searchItem[this.options.instanceValueProperty];
            } else {
                text += this.__getButtonText(item);
            }
        });

        return text;
    },

    __onButtonClick() {
        // if (this.getReadonly()) {
        //     return;
        // }
        // this.popoutView.trigger('toggle');
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

        // this.popoutView.close();
        this.__value(newValue, true);
    },

    __onContextChange(newData) {
        this.context = newData;
        this.updateContext(this.recordTypeId, newData);
    },

    __onBeforeOpen() {
        const panelModel = this.viewModel.get('panel');
        if (!panelModel.get('context')) {
            panelModel.set('context', this.__createTreeCollection(this.context, this.recordTypeId));
        }
    },

    __createTreeCollection(context, recordTypeId) {
        if (!context || !context[recordTypeId]) {
            return new Backbone.Collection();
        }
        const propertyTypes = this.options.propertyTypes;

        const mappedContext = {};
        Object.entries(context).forEach(([key, value]) => {
            const mappedProperties = value.reduce((filteredProperites, property) => {
                const isInstance = this.options.instanceTypeProperties.includes(property.type);
                if (!this.__isPropertyValid(property)) {
                    return filteredProperites;
                }
                const propertyModel = new Backbone.Model(property);
                if (isInstance && this.options.isInstanceExpandable) {
                    const linkedProperties = context[property[this.options.instanceValueProperty]];
                    if (linkedProperties) {
                        propertyModel.children = new Backbone.Collection(linkedProperties.filter(p => this.__isPropertyValid(p)));
                        propertyModel.collapsed = true;
                        propertyModel.children.forEach(childModel => (childModel.parent = propertyModel));
                    }
                }
                filteredProperites.push(propertyModel);

                return filteredProperites;
            }, []);
            mappedContext[key] = mappedProperties;
        });

        const collection = new Backbone.Collection(mappedContext[recordTypeId]);

        this.listenTo(collection, 'expand', model => this.__onExpand({ model, mappedContext }));

        return collection;
    },

    __isPropertyValid(property) {
        const { usePropertyTypes, propertyTypes } = this.options;
        const isFilterEnabled = usePropertyTypes && propertyTypes?.length;
        const isInstance = this.options.instanceTypeProperties.includes(property.type);
        return !isFilterEnabled || isInstance || propertyTypes.includes(property.type);
    },

    __onExpand({ model, mappedContext }) {
        if (!model.children) {
            return;
        }
        model.children.forEach(child => {
            const isInstance = this.options.instanceTypeProperties.includes(child.get('type'));
            if (isInstance) {
                const newChildren = mappedContext[child.get(this.options.instanceValueProperty)]?.map(m => m.toJSON());

                if (newChildren) {
                    child.children = new Backbone.Collection(newChildren);
                    child.collapsed = true;
                    child.children.forEach(childModel => (childModel.parent = child));
                }
            }
        });
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

    __onClearClick() {
        if (this.__isDoubleClicked) {
            this.__isDoubleClicked = false;
            return;
        }
        this.__value(null, true, true);
    }
});
