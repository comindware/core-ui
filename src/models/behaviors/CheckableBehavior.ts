import _ from 'underscore';

//can't use Backbone.Collection for checked because VirtualCollection change prototype

const CheckableBehavior = {};

CheckableBehavior.CheckableCollection = function(collection) {
    this.collection = collection;
    this.__updateChecked();
    this.__debounceUpdateChecked = _.debounce(this.__updateChecked, 10);
    collection.on('add remove reset update', function() {
        if (this.internalCheck || collection.internalUpdate) {
            return;
        }
        this.__debounceUpdateChecked();
    });
};

_.extend(CheckableBehavior.CheckableCollection.prototype, {
    check(model) {
        if (this.internalCheck || this.checked[model.cid]) {
            return;
        }

        this.checked[model.cid] = model;
        model.check();

        this.__triggerCheck();
    },

    uncheck(model) {
        if (this.internalCheck || !this.checked[model.cid]) {
            return;
        }
        this.collection.lastUncheckedModel = model.cid;
        delete this.checked[model.cid];
        model.uncheck();
        this.__triggerCheck();
    },

    checkSome(model) {
        if (!this.checked[model.cid]) {
            return;
        }

        delete this.checked[model.cid];
        model.checkSome();
        this.__triggerCheck();
    },

    // pressed we checked/unchecked the items in range [lastSelectedItem, thisItem]
    manyChangeChecked(model) {
        const collection = this.collection;
        const lastChangeModel = (model.checked) ? collection.lastUncheckedModel : collection.lastSelectedModel;
        if (!lastChangeModel) {
            if (model.checked) {
                this.uncheck(model);
            } else {
                this.check(model);
            }
            collection.lastChangeModel = model.cid;
        } else {
            let lastChangeIndex = 0;
            let thisIndex = 0;
            this.collection.forEach((m, i) => {
                if (m.cid === lastChangeModel) {
                    lastChangeIndex = i;
                }
                if (m === model) {
                    thisIndex = i;
                }
            });
            const startIndex = Math.min(lastChangeIndex, thisIndex);
            const endIndex = Math.max(lastChangeIndex, thisIndex);
            const models = this.collection.models;

            if (model.checked) {
                for (let i = startIndex; i <= endIndex; i++) {
                    models[i].uncheck();
                }
            } else {
                for (let i = startIndex; i <= endIndex; i++) {
                    models[i].check();
                }
            }
        }
    },

    checkAll() {
        this.internalCheck = true;
        this.each(model => {
            this.checked[model.cid] = model;
            model.check();
        });
        this.internalCheck = false;
        this.__triggerCheck();
    },

    uncheckAll() {
        this.internalCheck = true;
        this.each(model => {
            delete this.checked[model.cid];
            model.uncheck();
        });
        this.internalCheck = false;
        this.__triggerCheck();
    },

    toggleCheckAll() {
        const checkedLength = this.checked ? Object.keys(this.checked).length : 0;
        if (checkedLength === this.length) {
            this.uncheckAll();
        } else {
            this.checkAll();
        }
    },

    updateTreeNodesCheck(model, updateParent = true, shiftPressed) {
        if (model.children && model.children.length) {
            model.children.forEach(child => {
                if (typeof child.check !== 'function') {
                    child.checked = Boolean(model.checked);
                } else if (model.checked) {
                    child.check();
                } else {
                    child.uncheck();
                }
                this.updateTreeNodesCheck(child, false);
            });
        }
        if (!updateParent) {
            return;
        }
        let parent = model.parentModel;
        while (parent && parent.children) {
            const length = parent.children.length;
            const checkedLength = parent.children.filter(child => child.checked).length;
            if (checkedLength === length) {
                parent.check();
            } else if (checkedLength > 0 && checkedLength < length) {
                parent.checkSome();
            } else if (checkedLength === 0) {
                parent.uncheck();
            }
            parent = parent.parentModel;
        }
    },

    getCheckedModels() {
        return Object.values(this.checked || {});
    },

    __updateChecked() {
        this.checked = {};
        this.collection.each(model => {
            if (model.checked) {
                this.checked[model.cid] = model;
            }
        });
        this.__triggerCheck();
    },

    __triggerCheck() {
        const checkedLength = this.checked ? Object.keys(this.checked).length : 0;
        const length = this.length;

        if (checkedLength !== this.prevChechLength) {
            this.prevChechLength = checkedLength;

            if (checkedLength === length) {
                this.collection.trigger('check:all', this, 'checked');
                return;
            }

            if (checkedLength === 0) {
                this.collection.trigger('check:none', this, 'unchecked');
                return;
            }

            if (checkedLength > 0 && checkedLength < length) {
                this.collection.trigger('check:some', this, 'checkedSome');
            }
        }
    }
});

CheckableBehavior.CheckableModel = function(model) {
    this.model = model;
};

_.extend(CheckableBehavior.CheckableModel.prototype, {
    check() {
        if (this.checked) {
            return;
        }

        this.checked = true;
        this.trigger('checked', this);

        if (this.collection) {
            this.collection.check(this);
        }
    },

    uncheck() {
        if (this.checked === false) {
            return;
        }

        this.checked = false;
        this.trigger('unchecked', this);

        if (this.collection) {
            this.collection.uncheck(this);
        }
    },

    checkSome() {
        if (this.checked === null) {
            return;
        }

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

export default CheckableBehavior;
export const CheckableCollection = CheckableBehavior.CheckableCollection;
export const CheckableModel = CheckableBehavior.CheckableModel;
