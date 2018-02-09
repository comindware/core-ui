
/*eslint-disable*/

/*
* This is a modified version of Backbone.Picky with extended list of features related to multiselect collections
*
* */

const SelectableBehavior = {};

// SelectableBehavior.SingleSelect
// ------------------
// A single-select mixin for Backbone.Collection, allowing a single
// model to be selected within a collection. Selection of another
// model within the collection causes the previous model to be
// deselected.

SelectableBehavior.SingleSelect = function(collection) {
    this.collection = collection;
};

Object.assign(SelectableBehavior.SingleSelect.prototype, {

    // Select a model, deselecting any previously
    // selected model
    select(model) {
        if (model && this.selected === model) { return; }

        this.deselect();

        this.selected = model;
        this.selected.select();
        this.lastSelectedModel = model.cid;
        this.cursorCid = model.cid;
        this.trigger('select:one', model);
    },

    // Deselect a model, resulting in no model
    // being selected
    deselect(model) {
        if (!this.selected) { return; }

        model = model || this.selected;
        if (this.selected !== model) { return; }

        this.lastSelectedModel = undefined;
        this.cursorCid = undefined;
        this.selected.deselect();
        if (this.selected !== undefined) {
            this.trigger('deselect:one', this.selected);
            delete this.selected;
        }
    }

});

// SelectableBehavior.MultiSelect
// -----------------
// A mult-select mixin for Backbone.Collection, allowing a collection to
// have multiple items selected, including `selectAll` and `selectNone`
// capabilities.

SelectableBehavior.MultiSelect = function(collection) {
    this.collection = collection;
    this.selected = {};
};

Object.assign(SelectableBehavior.MultiSelect.prototype, {

    // Select a specified model, make sure the
    // model knows it's selected, and hold on to
    // the selected model.
    select(model) {
        if (this.selected[model.cid]) { return; }

        this.selected[model.cid] = model;
        model.select();
        calculateSelectedLength(this);
    },

    // Select a specified model and update selection for the whole collection according to the key modifiers
    selectSmart(model, ctrlPressed, shiftPressed) {
        const collection = this;
        if (!ctrlPressed && !shiftPressed) {
            // with no hotkeys we select this item and deselect the others
            collection.selectNone();
            model.select();
            collection.lastSelectedModel = model.cid;
            collection.cursorCid = model.cid;
        } else if (shiftPressed) {
            // if shift or ctrl+shift is pressed we select the items in range [lastSelectedItem, thisItem] and deselect the others
            const lastSelectedModel = collection.lastSelectedModel;
            if (!lastSelectedModel) {
                // we select this item alone if this is the first click
                collection.selectNone();
                model.select();
                collection.cursorCid = model.cid;
            } else {
                // if not, we select the range
                let lastSelectedIndex = 0;
                let thisIndex = 0;
                collection.each((m, i) => {
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
                collection.selectNone();
                for (let i = startIndex; i <= endIndex; i++) {
                    models[i].select();
                }
                collection.cursorCid = models[thisIndex].cid;
            }
        } else if (ctrlPressed) {
            // adding this item to the multiple selection list
            model.select();
            collection.lastSelectedModel = model.cid;
        }
    },

    // Deselect a specified model, make sure the
    // model knows it has been deselected, and remove
    // the model from the selected list.
    deselect(model) {
        if (!this.selected[model.cid]) { return; }

        delete this.selected[model.cid];
        model.deselect();
        calculateSelectedLength(this);
    },

    // Select all models in this collection
    selectAll() {
        this.each(model => { model.select(); });
        calculateSelectedLength(this);
    },

    // Deselect all models in this collection
    selectNone() {
        this.each(model => { model.deselect(); });
        calculateSelectedLength(this);
    },

    // Toggle select all / none. If some are selected, it
    // will select all. If all are selected, it will select
    // none. If none are selected, it will select all.
    toggleSelectAll() {
        if (this.selectedLength === this.length) {
            this.selectNone();
        } else {
            this.selectAll();
        }
    }
});

// SelectableBehavior.Selectable
// ----------------
// A selectable mixin for Backbone.Model, allowing a model to be selected,
// enabling it to work with SelectableBehavior.MultiSelect or on it's own

SelectableBehavior.Selectable = function(model) {
    this.model = model;
};

Object.assign(SelectableBehavior.Selectable.prototype, {

    // Select this model, and tell our
    // collection that we're selected
    select() {
        if (this.selected) { return; }

        this.selected = true;
        this.trigger('selected', this);

        if (this.collection) {
            this.collection.select(this);
        }
    },

    // Deselect this model, and tell our
    // collection that we're deselected
    deselect() {
        if (!this.selected) { return; }

        this.selected = false;
        this.trigger('deselected', this);

        if (this.collection) {
            this.collection.deselect(this);
        }
    },

    // Change selected to the opposite of what
    // it currently is
    toggleSelected() {
        if (this.selected) {
            this.deselect();
        } else {
            this.select();
        }
    }
});

// Helper Methods
// --------------

// Calculate the number of selected items in a collection
// and update the collection with that length. Trigger events
// from the collection based on the number of selected items.
const calculateSelectedLength = function(collection) {
    collection.selectedLength = _.filter(collection.models, model => model.selected).length;

    const selectedLength = collection.selectedLength;
    const length = collection.length;

    if (selectedLength === length) {
        collection.trigger('select:all', collection);
        return;
    }

    if (selectedLength === 0) {
        collection.trigger('select:none', collection);
        return;
    }

    if (selectedLength > 0 && selectedLength < length) {
        collection.trigger('select:some', collection);
    }
};

export default SelectableBehavior;
export var Selectable = SelectableBehavior.Selectable;
export var SingleSelect = SelectableBehavior.SingleSelect;
export var MultiSelect = SelectableBehavior.MultiSelect;
