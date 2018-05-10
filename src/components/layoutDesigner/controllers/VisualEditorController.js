//@flow
import ModuleView from '../views/ModuleView';
import ErrorService from '../services/ErrorService';
//import PropertyPathService from 'services/PropertyPathService';
import FormModel from '../models/RelationalModel';
import ComponentModel from '../models/ComponentModel';
import ComponentBehavior from '../behaviors/ComponentBehavior';
import VerticalLayoutComponentView from '../views/VerticalLayoutComponentView';

export default Marionette.Object.extend({
    initialize(options = {}) {
        this.canvasComponents = options.canvas.components;
        this.__createModel(options.editorModel, options.canvas.collection);
        this.view = this.__createView(options);
    },

    __onActionExecute(id, item) {
        switch (id) {
            case 'save':
                this.__handleSave();
                break;
            case 'saveAs':
                this.__handleSave(true);
                break;
            case 'clear':
                this.__handleClear();
                break;
            case 'delete':
                this.__handleDelete();
                break;
            default:
                this.trigger(`handle:${id}`, item);
                break;
        }
    },

    toggleEmptyViewMask(collection) {
        this.view.toggleMask(collection.length > 0);
    },

    updateModel(newModel, newCollection) {
        this.model.set(newModel.toJSON());
        this.view.updatePalette(this.model, newCollection);
    },

    performValidation() {
        return this.__validateCanvasComponents(this.model.get('form'));
    },

    __createAndBindChannel() {
        const reqres = Backbone.Radio.channel(_.uniqueId());

        reqres.reply('component:resolve', this.__resolveComponent, this);
        reqres.reply('component:move', this.__moveComponent, this);
        reqres.reply('component:add', this.__handleAdding, this);
        reqres.reply('component:add:column', this.__handleAddingNewColumn, this);
        reqres.reply('component:move:column', this.__handleMovingNewColumn, this);
        reqres.reply('element:create', this.__createElement, this);
        reqres.reply('component:remove:column', this.__handleRemovingColumn, this);

        return reqres;
    },

    __createModel(editorModel, canvasCollection) {
        const rootModel = editorModel.has('root') ? _.omit(editorModel.get('root'), 'rows') : {};
        const configurationKey = this.options.configurationKey;
        const form = Object.assign(editorModel.toJSON(), {
            root: new ComponentModel(
                Object.assign(
                    {
                        rows: canvasCollection,
                        fieldType: 'SystemView',
                        childrenAttribute: 'rows'
                    },
                    rootModel
                )
            ),
            fieldType: 'SystemView'
        });

        if (this.canvasComponents.SystemView) {
            form.root.set('view', this.canvasComponents.SystemView);
        }

        this.formModel = new FormModel({ form, components: this.canvasComponents }, { parse: true });

        this.listenTo(this.formModel, 'change:name', (model, name) => this.trigger('title:changed', name));

        this.listenTo(this.formModel, 'attribute:changed', (model, propertyName, value) => this.trigger('attribute:changed', model, propertyName, value));

        this.model = new Backbone.Model({
            recordTypeId: editorModel.get('recordTypeId') || editorModel.get('recordTemplateId') || editorModel.get('container'),
            context: editorModel.get('context'),
            formComponents: editorModel.get('formComponents'),
            form: this.formModel
        });

        this.configurationModel = new Backbone.Model({ id: configurationKey });

        if (configurationKey) {
            this.configurationModel.set($.jStorage.get(configurationKey));
        }

        this.listenTo(
            this.model
                .get('form')
                .get('root')
                .get('rows'),
            'add remove reset',
            (model, collection) => this.toggleEmptyViewMask(collection)
        );
    },

    tryLeave() {
        if (!this.model.get('form') || !this.model.get('form').isModified) {
            return true;
        }

        return Core.services.MessageService.showMessageDialog(
            Localizer.get('PROCESS.FORMDESIGNER.DIALOGMESSAGES.UNSAVEDCHANGES'),
            Localizer.get('PROCESS.FORMDESIGNER.DIALOGMESSAGES.WARNING'),
            [
                {
                    id: true,
                    text: Localizer.get('PROCESS.FORMDESIGNER.DIALOGMESSAGES.DISCARD')
                },
                {
                    id: false,
                    text: Localizer.get('PROCESS.FORMDESIGNER.DIALOGMESSAGES.STAYONTHEPAGE'),
                    default: true
                }
            ]
        );
    },

    __createView(options) {
        const reqres = this.__createAndBindChannel();

        const view = new ModuleView({
            reqres,
            model: this.model,
            configurationModel: this.configurationModel,
            palette: options.palette,
            canvas: options.canvas,
            properties: options.properties,
            toolbar: options.toolbar,
            componentReqres: this.getOption('componentReqres'),
            detachedToolbar: options.detachedToolbar
        });

        this.listenToOnce(view, 'render', () => this.toggleEmptyViewMask(options.canvas.collection));
        if (options.validateOnShow) {
            this.listenToOnce(view, 'show', this.performValidation);
        }
        this.listenTo(view, 'add:attribute', this.__handleAdding);
        this.listenTo(view, 'remove:attribute', this.__handleRemoving);
        this.listenTo(view, 'edit:attribute', event => this.trigger('edit:attribute', event));
        this.listenTo(view, 'handle:action', actionId => this.trigger('handle:action', actionId));
        this.listenTo(view, 'handle:edit', editedView => this.trigger('handle:edit', editedView));

        this.listenTo(view, 'toolbar:execute', (id, item) => this.__onActionExecute(id, item));

        this.listenTo(view, 'destroy', () => this.destroy());

        return view;
    },

    __createElement(elementModel) {
        const component = this.canvasComponents[elementModel.get('fieldType')];
        const model = new component.model(elementModel.toJSON());

        //const path = PropertyPathService.getPropertyPath(model);
        model.set(
            {
                //path,
                //pathNames: PropertyPathService.getPropertyPathNames(model),
                formComponents: this.formModel.get('formComponents'),
                dataSourceInfo: {
                    //propertyPath: path,
                    type: model.get('fieldType')
                }
            },
            { parse: true }
        );

        model.unset('id');
        model.unset('children');
        model.unset('context');
        model.unset('parent');

        return model;
    },

    __resolveComponent(model) {
        try {
            const component = this.canvasComponents[model.get('fieldType')];
            const defaultParams = component.model.prototype.defaults;

            if (defaultParams && defaultParams.componentType === 'container') {
                if (component.view) {
                    const result = {};
                    Object.keys(component.view.prototype).forEach(key => {
                        result[key] = component.view.prototype[key];
                    });
                    return VerticalLayoutComponentView.extend(result);
                }
                return VerticalLayoutComponentView;
            }
            return component.view.extend({
                behaviors: Object.assign(
                    {
                        ComponentBehavior: {
                            behaviorClass: ComponentBehavior
                        }
                    },
                    component.view.prototype.behaviors || {}
                )
            });
        } catch (e) {
            console.error(e);
        }
    },

    async __handleSave(saveAsNew) {
        const isFormModelValid = this.__validateCanvasComponents(this.model.get('form'));

        if (isFormModelValid) {
            const form = this.model.get('form');
            const formData = form.toJSON({ server: true });
            if (formData) {
                await this.trigger('handle:save', formData, saveAsNew);

                this.model.get('form').clearModified();
            }
        }
    },

    __handleDelete() {
        this.trigger('handle:delete', this.model.get('form').id);
    },

    __handleClear() {
        this.model.get('form').clearCanvas();
    },

    __moveComponent(model, collection, index) {
        this.trigger('move:component', model, collection, index);
        model.collection.remove(model);
        collection.add(model, {
            at: index
        });
    },

    __handleAddingNewColumn(model, collection, prefix, index) {
        let itemIndex = index;
        let horizontalItems;
        if (collection.parent.getChildren()) {
            horizontalItems = collection.parent.getChildren();
        } else {
            horizontalItems = collection.parent;
        }

        if (prefix === 'right') {
            itemIndex++;
        }

        const dsi = collection.parent.get('dataSourceInfo');

        this.trigger('add:new:column:data', horizontalItems, model, itemIndex, dsi && dsi.propertyPath);
    },

    __handleMovingNewColumn(model, collection, prefix, index) {
        let itemIndex = index;
        let horizontalItems;
        if (collection.parent.getChildren()) {
            horizontalItems = collection.parent.getChildren();
        } else {
            horizontalItems = collection.parent;
        }

        if (prefix === 'right') {
            itemIndex++;
        }
        this.trigger('move:column:data', horizontalItems, model, itemIndex);
    },

    __handleRemovingColumn(model, collection) {
        this.trigger('remove:column:data', model, collection);
    },

    __handleAdding(model, collection, index) {
        this.trigger('add:component', model, collection, index);
        collection.add(model, {
            at: index
        });
    },

    __handleRemoving(model) {
        if (model === this.model.get('form').get('root') || !model.collection) {
            return;
        }
        const doDelete = result => {
            if (!result) {
                return;
            }

            if (model.collection.length === 1) {
                model.deselect();
                const parent = model.parent;
                if (parent && parent.collection && !model.get('horizontalDrop')) {
                    parent.collection.remove(parent);
                } else {
                    model.collection.remove(model);
                }
            } else {
                model.deselect();
                if (model.get('container')) {
                    this.__handleRemovingColumn(model, model.collection);
                } else {
                    model.collection.remove(model);
                }
            }
        };

        if (model.isContainer && model.get(model.get('childrenAttribute') || 'rows').length > 0) {
            const userRequest = Core.services.MessageService.confirm(Localizer.get('PROCESS.FORMDESIGNER.DIALOGMESSAGES.DELETECONFIRMATION'));
            userRequest.then(doDelete);
        } else {
            doDelete(true);
        }
        this.trigger('remove:component', model, model.collection);
    },

    __validateCanvasComponents(formModel) {
        const validationErrors = ErrorService.validateCanvasComponents(formModel);

        return !validationErrors.length;
    }
});
