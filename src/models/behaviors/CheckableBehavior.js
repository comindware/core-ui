/*eslint-disable*/

const CheckableBehavior = {};

CheckableBehavior.CheckableCollection = class extends Backbone.Collection {
    constructor(collection) {
        super();
        this.collection = collection;
        this.__updateChecked();
        collection.on('add remove reset update', () => {
            if (collection.internalUpdate) {
                return;
            }
            this.__updateChecked();
        });
    }

    check(model) {
        if (this.internalCheck || this.checked[model.cid]) { return; }

        this.checked[model.cid] = model;
        model.check();
        this.__triggerCheck();
    }

    uncheck(model) {
        if (this.internalCheck || !this.checked[model.cid]) { return; }

        delete this.checked[model.cid];
        model.uncheck();
        this.__triggerCheck();
    }

    checkSome(model) {
        if (!this.checked[model.cid]) { return; }

        delete this.checked[model.cid];
        model.checkSome();
        this.__triggerCheck();
    }

    checkAll() {
        this.internalCheck = true;
        this.each(model => {
            this.checked[model.cid] = model;
            model.check();
        });
        this.internalCheck = false;
        this.__triggerCheck();
    }

    uncheckAll() {
        this.internalCheck = true;
        this.each(model => {
            delete this.checked[model.cid];
            model.uncheck();
        });
        this.internalCheck = false;
        this.__triggerCheck();
    }

    toggleCheckAll() {
        if (this.checkedLength === this.length) {
            this.uncheckAll();
        } else {
            this.checkAll();
        }
    }

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

    __updateChecked() {
        this.checked = {};
        this.each(model => {
            if (model.checked) {
                this.checked[model.cid] = model;
            }
        });
        this.__triggerCheck();
    }

    __triggerCheck() {
        const checkedLength = this.checked ? Object.keys(this.checked).length : 0;
        const length = this.length;
    
        if (checkedLength === length) {
            this.trigger('check:all', this);
            return;
        }
    
        if (checkedLength === 0) {
            this.trigger('check:none', this);
            return;
        }
    
        if (checkedLength > 0 && checkedLength < length) {
            this.trigger('check:some', this);
        }
    }
}

CheckableBehavior.CheckableModel = class {
    constructor(model) {
        this.model = model;
    }

    check() {
        if (this.checked) { return; }

        this.checked = true;
        this.trigger('checked', this);

        if (this.collection) {
            this.collection.check(this);
        }
    }

    uncheck() {
        if (this.checked === false) { return; }

        this.checked = false;
        this.trigger('unchecked', this);

        if (this.collection) {
            this.collection.uncheck(this);
        }
    }

    checkSome() {
        if (this.checked === null) { return; }

        this.checked = null;
        this.trigger('checked:some', this);
        if (this.collection) {
            this.collection.checkSome(this);
        }
    }

    toggleChecked() {
        if (this.checked) {
            this.uncheck();
        } else {
            this.check();
        }
    }
}

export default CheckableBehavior;
export const CheckableCollection = CheckableBehavior.CheckableCollection;
export const CheckableModel = CheckableBehavior.CheckableModel;
