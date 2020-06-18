import _ from 'underscore';

const SelectableBehavior = {
    // SelectableBehavior.SingleSelect
    // ------------------
    // A single-select mixin for Backbone.Collection, allowing a single
    // model to be selected within a collection. Selection of another
    // model within the collection causes the previous model to be
    // deselected.
    // ToDo: should update this.selected on collection reset or remove selected.
    SingleSelect: function(collection: Backbone.Collection) {
        this.selected = {};
        this.collection = collection;
    },
    // SelectableBehavior.MultiSelect
    // -----------------
    // A mult-select mixin for Backbone.Collection, allowing a collection to
    // have multiple items selected, including `selectAll` and `selectNone`
    // capabilities.
    MultiSelect: function(collection: Backbone.Collection) {
        this.collection = collection;
        this.selected = {};
    },
    // SelectableBehavior.Selectable
    // ----------------
    // A selectable mixin for Backbone.Model, allowing a model to be selected,
    // enabling it to work with SelectableBehavior.MultiSelect or on it's own

    Selectable: function() {}
};

_.extend(SelectableBehavior.SingleSelect.prototype, {
    // Select a model, deselecting any previously
    // selected model
    select(model, ctrlPressed, shiftPressed, selectOnCursor, options) {
        if (model && this.selected && this.selected[model.cid] === model) {
            return;
        }

        this.deselect(undefined, options);

        this.selected[model.cid] = model;
        this.selected[model.cid].select(options);

        this.lastSelectedModel = model.cid;
        this.cursorCid = model.cid;
        this.trigger('select:one', model, options);
    },

    // Deselect a model, resulting in no model
    // being selected
    deselect(model = this.selected[this.lastSelectedModel], options) {
        if (!this.lastSelectedModel) {
            return;
        }
        const lastSelectedModel = this.selected[this.lastSelectedModel];

        if (!lastSelectedModel || lastSelectedModel !== model) {
            return;
        }

        lastSelectedModel.deselect(options);
        this.cursorCid = undefined;
        this.lastDeselectedModel = model.cid;
        if (this.selected[this.lastSelectedModel] !== undefined) {
            //todo why we need to do this!?
            this.trigger('deselect:one', this.selected[this.lastSelectedModel], options);
            delete this.selected[this.lastSelectedModel];
            this.lastSelectedModel = undefined;
        }
    },

    getSelected() {
        // selectable not update selected on remove selected item
        const selectedModels = Object.values(this.selected).filter(function(selecteModel) {
            return this.has(selecteModel);
        }, this);
        const length = selectedModels.length;
        if (length > 1) {
            console.warn(`single select has ${length} selected models`);
        }
        return selectedModels[0];
    }
});

_.extend(SelectableBehavior.MultiSelect.prototype, {
    // Select a specified model, make sure the
    // model knows it's selected, and hold on to
    // the selected model.
    select(model, ctrlPressed, shiftPressed, selectOnCursor, options) {
        if (this.selected[model.cid]) {
            return;
        }

        this.selected[model.cid] = model;
        model.select(options);
        if (selectOnCursor === false) {
            this.pointOff();
            model.pointTo();
            this.lastPointedModel = model;
            this.cursorCid = model.cid;
        }
        calculateSelectedLength(this, options);
    },

    // Select a specified model and update selection for the whole collection according to the key modifiers
    selectSmart(model, ctrlPressed, shiftPressed, selectOnCursor, options) {
        const collection = this;
        if (selectOnCursor === false) {
            collection.pointOff();
            model.pointTo();
            collection.lastPointedModel = model;
            collection.cursorCid = model.cid;
        } else if (!ctrlPressed && !shiftPressed) {
            // with no hotkeys we select this item and deselect the others
            // collection.selectNone();
            Object.values(collection.selected).forEach(selected => {
                if (selected !== model) {
                    selected.deselect(options);
                }
            });
            model.select(options);
            collection.lastSelectedModel = model.cid;
            collection.cursorCid = model.cid;
        } else if (shiftPressed) {
            // if shift or ctrl+shift is pressed we select the items in range [lastSelectedItem, thisItem] and deselect the others
            const lastSelectedModel = collection.lastSelectedModel;
            if (!lastSelectedModel) {
                // we select this item alone if this is the first click
                Object.values(collection.selected).forEach(selected => {
                    if (selected !== model) {
                        selected.deselect(options);
                    }
                });
                model.select(options);
                collection.cursorCid = model.cid;
            } else {
                // if not, we select the range
                let lastSelectedIndex = 0;
                let thisIndex = 0;
                collection.forEach((m, i) => {
                    if (m.cid === lastSelectedModel) {
                        lastSelectedIndex = i;
                    }
                    if (m === model) {
                        thisIndex = i;
                    }
                });
                const startIndex = Math.min(lastSelectedIndex, thisIndex);
                const endIndex = Math.max(lastSelectedIndex, thisIndex);
                const models = collection.models;
                Object.values(collection.selected).forEach(selected => {
                    if (selected !== model) {
                        selected.deselect(options);
                    }
                });
                for (let i = startIndex; i <= endIndex; i++) {
                    models[i].select(options);
                }
                collection.cursorCid = models[thisIndex].cid;
            }
        } else if (ctrlPressed) {
            // adding this item to the multiple selection list
            model.select(options);
            collection.lastSelectedModel = model.cid;
        }
    },

    // Deselect a specified model, make sure the
    // model knows it has been deselected, and remove
    // the model from the selected list.
    deselect(model, options) {
        if (!this.selected[model.cid]) {
            return;
        }

        delete this.selected[model.cid];
        model.deselect(options);
        calculateSelectedLength(this, options);
    },

    // Select all models in this collection
    selectAll(options) {
        this.forEach(model => {
            model.select(options);
        });
        calculateSelectedLength(this, options);
    },

    // Deselect all models in this collection
    selectNone(options) {
        this.forEach(model => {
            model.deselect(options);
        });
        calculateSelectedLength(this, options);
    },

    pointOff() {
        this.lastPointedModel && this.lastPointedModel.pointOff();
        delete this.lastPointedModel;
    },

    // Toggle select all / none. If some are selected, it
    // will select all. If all are selected, it will select
    // none. If none are selected, it will select all.
    toggleSelectAll(options) {
        if (this.selectedLength === this.length) {
            this.selectNone(options);
        } else {
            this.selectAll(options);
        }
    },

    getSelected() {
        // selectable not update selected on remove selected item
        return Object.values(this.selected).filter(function(selecteModel) {
            return this.has(selecteModel);
        }, this);
    }
});

_.extend(SelectableBehavior.Selectable.prototype, {
    // Select this model, and tell our
    // collection that we're selected
    select(options) {
        if (this.selected) {
            return;
        }

        this.selected = true;
        this.trigger('selected', this, options);

        const collection = this.selectableCollection || this.collection;
        if (collection && collection.select) {
            collection.select(this, undefined, undefined, undefined, options);
        }
    },

    // Deselect this model, and tell our
    // collection that we're deselected
    deselect(options) {
        if (!this.selected) {
            return;
        }

        this.selected = false;
        this.trigger('deselected', this, options);

        const collection = this.selectableCollection || this.collection;
        if (collection && collection.deselect) {
            collection.deselect(this, undefined, undefined, undefined, options);
        }
    },

    pointTo() {
        this.pointed = true;
        this.trigger('pointed', this);
    },

    pointOff() {
        this.pointed = false;
        this.trigger('unpointed', this);
    },

    // Change selected to the opposite of what
    // it currently is
    toggleSelected(isSelect = !this.selected, options) {
        if (isSelect) {
            this.select(options);
        } else {
            this.deselect(options);
        }
    }
});

// Helper Methods
// --------------

// Calculate the number of selected items in a collection
// and update the collection with that length. Trigger events
// from the collection based on the number of selected items.
const calculateSelectedLength = _.debounce((collection, options) => {
    collection.selectedLength = collection.parentCollection ? collection.models.filter(model => model.selected).length : collection.filter(model => model.selected).length;

    const selectedLength = collection.selectedLength;
    const length = collection.length;

    if (selectedLength === length) {
        collection.trigger('select:all', collection, options);
        return;
    }

    if (selectedLength === 0) {
        collection.trigger('select:none', collection, options);
        return;
    }

    if (selectedLength > 0 && selectedLength < length) {
        collection.trigger('select:some', collection, options);
    }
}, 10);

export default SelectableBehavior;
export var Selectable = SelectableBehavior.Selectable;
export var SingleSelect = SelectableBehavior.SingleSelect;
export var MultiSelect = SelectableBehavior.MultiSelect;
