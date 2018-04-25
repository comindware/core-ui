//@flow
//import AliasService from 'services/AliasService';
const extendParams = {
    relational: true,
    selected: false,
    hovered: false,

    getChildren() {
        return this.get(this.get('childrenAttribute'));
    },

    getParent() {
        if (!this.collection) {
            return null;
        }
        return this.collection.parent;
    },

    hover() {
        this.hovered = true;
        this.trigger('hovered');
    },

    unhover() {
        this.hovered = false;
        this.trigger('unhovered');
    },

    select() {
        this.selected = true;
        this.trigger('selected');
    },

    deselect() {
        this.selected = false;
        this.trigger('deselected');
    }
};

const relationalCollection = Backbone.Collection.extend(extendParams);

export default Backbone.Model.extend({
    defaults() {
        return {
            name: Localizer.get('PROCESS.FORMDESIGNER.NEWFORM'),
            alias: 'newForm',
            root: new Backbone.Model({
                width: 0,
                rows: new Backbone.Collection(),
                fieldType: 'VerticalLayout'
            })
        };
    },

    parse(data) {
        const rawForm = data.form;
        this.formComponents = data.components;
        if (rawForm) {
            const rows = rawForm.root.get('rows');
            //AliasService.initialize(this);
            const containerCollection = new relationalCollection(rows.map(rootModel => this.__buildChildrenModel(rootModel, rawForm.root)));
            this.listenTo(containerCollection, 'add', this.__handleModelChanges);
            this.listenTo(containerCollection, 'add remove reset', this.__setModified);
            this.listenTo(containerCollection, 'change', this.__onAttributeChanged);
            rawForm.root.set({ rows: containerCollection });
            rawForm.root.parent = this;

            return rawForm;
        }
        return data;
    },

    eachComponent(callback) {
        const handle = model => {
            model.getChildren().each(child => {
                callback(child);
                if (child.isContainer) {
                    handle(child);
                }
            });
        };
        handle(this.get('root'));
    },

    clearModified() {
        this.isModified = false;
    },

    clearCanvas() {
        const modelsToRemove = [];
        const rows = this.get('root').get('rows');
        if (rows) {
            rows.each(model => {
                if (model.get('canRemove') !== false) {
                    modelsToRemove.push(model);
                } else {
                    model.getChildren().reset();
                }
            });
            rows.remove(modelsToRemove);
        }
    },

    toJSON(options) {
        const data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        if (options && options.server === true) {
            const newData = data.root.clone();
            delete data.context;
            delete data.userCommands;
            delete data.children;
            delete data.parent;
            newData.unset('view');
            newData.unset('context');
            newData.unset('operations');
            newData.unset('userCommands');
            newData.set('rows', this.__parseChildren(newData.get('rows'), options));

            return Object.assign({}, data, { root: newData.toJSON(options) });
        }
        return data;
    },

    __buildChildrenModel(model, parent) {
        const component = this.formComponents[model.get('type')] || this.formComponents[model.get('fieldType')];
        const container = new (component.model.extend(extendParams))(model.toJSON(), { parse: !model.relational });
        const childrenAttribute = container.get('childrenAttribute');

        container.isContainer = false;
        if (childrenAttribute) {
            const rows = container.get(childrenAttribute).map(innerModel => this.__buildChildrenModel(innerModel, container)) || new Backbone.Collection();
            const child = new relationalCollection(rows);
            child.parent = parent;
            container.isContainer = true;
            container.set(childrenAttribute, child);
            this.listenTo(child, 'add', newModel => this.__handleModelChanges(newModel, container));
            this.listenTo(child, 'add remove reset change', this.__setModified);
        }
        container.parent = parent;
        return container;
    },

    __handleModelChanges(model, parent) {
        const newModel = this.__buildChildrenModel(model, parent);
        model.clear();
        model.isContainer = newModel.isContainer;
        model.set(newModel.toJSON());
        model.parent = newModel.parent;
        Object.assign(model, extendParams);
    },

    __parseChildren(collection, options) {
        const newCollection = collection.toJSON(options);
        return newCollection.map(model => {
            if (model.childrenAttribute) {
                model[model.childrenAttribute] = this.__parseChildren(model[model.childrenAttribute], options);
            }
            return model;
        });
    },

    __setModified() {
        this.isModified = true;
    },

    __onAttributeChanged(model, xls, options) {
        if (options && options.isSilent) {
            return;
        }

        this.isModified = true;
        const changedPropertyName = Object.keys(model.changed)[0];
        this.trigger('attribute:changed', model, changedPropertyName, model.changed[changedPropertyName]);
    }
});
