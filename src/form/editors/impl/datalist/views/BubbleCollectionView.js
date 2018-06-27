// @flow
import BubbleItemView from './BubbleItemView';
import InputView from './InputView';
import FakeInputModel from '../models/FakeInputModel';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.collection = this.model.selected;
    },

    className: 'bubbles__list',

    childView(model) {
        if (model instanceof FakeInputModel) {
            return InputView;
        }
        return BubbleItemView;
    },

    focus() {
        const fakeInputModel = this.__findFakeInputModel();
        if (!fakeInputModel) {
            return;
        }
        const input = this.children.findByModel(fakeInputModel);
        if (input && input.focus) {
            input.focus();
        }
    },

    blur() {
        const fakeInputModel = this.__findFakeInputModel();
        if (!fakeInputModel) {
            return;
        }
        const input = this.children.findByModel(fakeInputModel);

        if (input && input.blur) {
            input.blur();
        }
    },

    updateInput() {
        const fakeInputModel = this.__findFakeInputModel();
        if (fakeInputModel) {
            const input = this.children.findByModel(fakeInputModel);
            if (input) {
                input.updateInput();
            }
        }
    },

    __findFakeInputModel() {
        return this.collection.models.find(model => model instanceof FakeInputModel && model);
    },

    childViewOptions() {
        return {
            reqres: this.reqres,
            parent: this.$el,
            enabled: this.options.enabled,
            createValueUrl: this.options.createValueUrl,
            showEditButton: this.options.showEditButton,
            showRemoveButton: this.options.canDeleteItem,
            getDisplayText: this.options.getDisplayText
        };
    },

    updateEnabled(enabled) {
        this.children.each(cv => {
            if (cv.updateEnabled) {
                cv.updateEnabled(enabled);
            }
        });
    }
});
