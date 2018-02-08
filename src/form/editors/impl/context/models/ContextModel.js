
/* eslint-disable */

import { objectPropertyTypes } from '../../../../../Meta';
import VirtualCollection from '../../../../../collections/VirtualCollection';

var ContextModel = Backbone.Model.extend({
    initialize() {
        this.set('hasChildren', Boolean(this.get('instanceTypeId')) && this.get('type') !== objectPropertyTypes.COLLECTION);
        this.collapsed = true;
    },

    defaults() {
        return {
            children: new ContextCollection(undefined, { comparator: model => model.get('name') })
        };
    },

    populateChildren() {
        if (!this.get('hasChildren')) {
            return;
        }

        this.get('children').reset();
        let hasChildren = false;
        const checkedProperties = {};

        this.get('context')[this.get('instanceTypeId')].forEach(attributes => {
            const propertyTypes = this.get('propertyTypes');
            const usePropertyTypes = this.get('usePropertyTypes');

            if (!this.checkPropertyType(attributes, true, checkedProperties)) { return; }

            hasChildren = true;
            const modelAttributes = Object.assign({
                context: this.get('context'),
                propertyTypes,
                usePropertyTypes,
                parent: this,
                children: new ContextCollection(undefined, { comparator: model => model.get('name') })
            }, attributes);
            this.get('children').add(modelAttributes);
        }, this);
        this.set('hasChildren', hasChildren);
    },

    toggleCollapsed() {
        if (this.getCollapsed()) {
            this.__expand();
        } else {
            this.__collapse();
        }
    },

    setCollapsed(value) {
        this.collapsed = value;
        this.trigger((value ? 'collapsed' : 'expanded'), this);
    },

    getCollapsed() {
        return this.collapsed;
    },

    setSelected(value) {
        this.selected = value;
        this.trigger((value ? 'selected' : 'deselected'), this);
    },

    getSelected() {
        return this.selected;
    },

    selectPath(selectedItem) {
        if (!selectedItem || selectedItem.length === 0) {
            return;
        }
        selectedItem = [].concat(selectedItem);
        _.each(this.get('children').models, child => {
            if (_.indexOf(selectedItem, child.get('id')) > -1) {
                if (selectedItem.length === 1) {
                    child.setSelected(true);
                    return false;
                }
                child.setCollapsed(false);
                child.populateChildren();
                child.selectPath(selectedItem.slice(1));
            }
        });
    },

    getPath() {
        const context = [];
        let model = this;
        while (model.get('parent')) {
            context.push(model.get('id'));
            model = model.get('parent');
        }
        return context.reverse();
    },

    __collapse() {
        if (this.getCollapsed()) {
            return;
        }
        _.each(this.get('children').models, model => {
            if (model.get('type') !== objectPropertyTypes.INSTANCE) {
                return;
            }
            model.__collapse();
        });
        this.setCollapsed(true);
    },

    __expand() {
        if (!this.getCollapsed()) {
            return;
        }
        if (this.get('children').length === 0) {
            this.populateChildren();
        }
        this.setCollapsed(false);
    },

    compatible: {
        Integer: ['Decimal'],
        Decimal: ['Integer']
    },

    checkPropertyType(options, checkChildren, checkedProperties) {
        if (!this.get('usePropertyTypes')) { return true; }

        if (!checkedProperties) {
            checkedProperties = {};
        }
        if (_.intersection(this.get('propertyTypes'), _.union([options.type], this.compatible[options.type] || [])).length > 0) {
            if (this.get('instanceRecordTypeId')) {
                if (options.recordTypeId === this.get('instanceRecordTypeId')) {
                    checkedProperties[options.id] = true;
                    return true;
                }
            } else {
                checkedProperties[options.id] = true;
                return true;
            }
        }

        if (checkChildren && options.type === objectPropertyTypes.INSTANCE) {
            if (checkedProperties.hasOwnProperty(options.id)) {
                return checkedProperties[options.id];
            }
            checkedProperties[options.id] = false;
            const result = _.any(this.get('context')[options.instanceTypeId], function(attributes) {
                return this.checkPropertyType(attributes, true, checkedProperties);
            }, this);
            checkedProperties[options.id] = result;
            return result;
        }
        checkedProperties[options.id] = false;
        return false;
    }
});

var ContextCollection = VirtualCollection.extend({
    model: ContextModel
});

export default ContextModel;