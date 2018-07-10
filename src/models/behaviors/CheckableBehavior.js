/*eslint-disable*/


const CheckableBehavior = {};

CheckableBehavior.CheckableCollection = function (collection) {
    this.collection = collection;
    this.checked = {};
    collection.on('add remove reset update', () => {
        if (collection.internalUpdate) {
            return;
        }
        updateChecked(collection);
        calculateCheckedLength(collection);
    });
};

_.extend(CheckableBehavior.CheckableCollection.prototype, {

    check(model) {
        if (this.internalCheck || this.checked[model.cid]) { return; }

        this.checked[model.cid] = model;
        model.check();
        calculateCheckedLength(this);
    },

    uncheck(model) {
        if (this.internalCheck || !this.checked[model.cid]) { return; }

        delete this.checked[model.cid];
        model.uncheck();
        calculateCheckedLength(this);
    },

    checkSome(model) {
        if (!this.checked[model.cid]) { return; }

        delete this.checked[model.cid];
        model.checkSome();
        calculateCheckedLength(this);
    },

    checkAll() {
        this.internalCheck = true;
        this.each(model => {
            this.checked[model.cid] = model;
            model.check();
        });
        this.internalCheck = false;
        calculateCheckedLength(this);
    },

    uncheckAll() {
        this.internalCheck = true;
        this.each(model => {
            delete this.checked[model.cid];
            model.uncheck();
        });
        this.internalCheck = false;
        calculateCheckedLength(this);
    },

    toggleCheckAll() {
        if (this.checkedLength === this.length) {
            this.uncheckAll();
        } else {
            this.checkAll();
        }
    },

    updateTreeNodesCheck(model, updateParent = true) {
        if (model.children && model.children.length) {
            model.children.forEach(child => {
                if (model.checked) {
                    child.check();
                } else {
                    child.uncheck();
                }
                this.updateTreeNodesCheck(child, false);
            })
        }
        if (!updateParent) {
            return;
        }
        let parent = model.parentModel;
        while (parent && parent.children) {
            const length = parent.children.length;
            const checkedLength = parent.children.filter(child => child.checked || child.checked === null).length;
            if (checkedLength === length) {
                parent.check()
            } else if (checkedLength > 0 && checkedLength < length) {
                parent.checkSome();
            } else if (checkedLength === 0) {
                parent.uncheck();
            }
            parent = parent.parentModel;
        }
    }
});

CheckableBehavior.CheckableModel = function (model) {
    this.model = model;
};

_.extend(CheckableBehavior.CheckableModel.prototype, {

    check() {
        if (this.checked) { return; }

        this.checked = true;
        this.trigger('checked', this);

        if (this.collection) {
            this.collection.check(this);
        }
    },

    uncheck() {
        if (this.checked === false) { return; }

        this.checked = false;
        this.trigger('unchecked', this);

        if (this.collection) {
            this.collection.uncheck(this);
        }
    },

    checkSome() {
        if (this.checked === null) { return; }

        this.checked = null;
        this.trigger('checked:some', this);
        if (this.collection) {
            this.collection.checkSome(this);
        }
    },

    toggleChecked() {
        if (this.checked) {
            this.uncheck();
        } else {
            this.check();
        }
    }
});

const updateChecked = collection => {
    collection.checked = {};
    collection.each(model => {
        if (model.checked) {
            collection.checked[model.cid] = model;
        }
    });
};

const calculateCheckedLength = _.debounce(collection => {
    collection.checkedLength = _.filter(collection.models, model => model.checked).length;

    const checkedLength = collection.checkedLength;
    const length = collection.length;

    if (checkedLength === length) {
        collection.trigger('check:all', collection);
        return;
    }

    if (checkedLength === 0) {
        collection.trigger('check:none', collection);
        return;
    }

    if (checkedLength > 0 && checkedLength < length) {
        collection.trigger('check:some', collection);
    }
}, 10);

export default CheckableBehavior;
export const CheckableCollection = CheckableBehavior.CheckableCollection;
export const CheckableModel = CheckableBehavior.CheckableModel;
