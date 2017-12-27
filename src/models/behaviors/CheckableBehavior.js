/**
 * Developer: Stepan Burguchev
 * Date: 8/19/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/*eslint-disable*/


const CheckableBehavior = {};

CheckableBehavior.CheckableCollection = function(collection) {
    this.collection = collection;
    this.checked = {};
    collection.on('add remove reset', () => {
        calculateCheckedLength(collection);
        Object.entries(this.checked).forEach(entry => {
            if (!collection.get(entry[0])) {
                delete this.checked[entry[0]]
            }
        })
    });
};

_.extend(CheckableBehavior.CheckableCollection.prototype, {

    check(model) {
        if (this.checked[model.cid]) { return; }

        this.checked[model.cid] = model;
        model.check();
        calculateCheckedLength(this);
    },

    uncheck(model) {
        if (!this.checked[model.cid]) { return; }

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
        this.each(model => { model.check(); });
        calculateCheckedLength(this);
    },

    uncheckAll() {
        this.each(model => { model.uncheck(); });
        calculateCheckedLength(this);
    },

    toggleCheckAll() {
        if (this.checkedLength === this.length) {
            this.uncheckAll();
        } else {
            this.checkAll();
        }
    }
});

CheckableBehavior.CheckableModel = function(model) {
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

const calculateCheckedLength = function(collection) {
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
};

export default CheckableBehavior;
export const CheckableCollection = CheckableBehavior.CheckableCollection;
export const CheckableModel = CheckableBehavior.CheckableModel;
