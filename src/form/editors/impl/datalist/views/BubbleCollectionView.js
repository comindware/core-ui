// @flow
import BubbleItemView from './BubbleItemView';
import InputView from './InputView';
import FakeInputModel from '../models/FakeInputModel';

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.collection = options.collection;
    },

    className: 'bubbles__list',

    childView(model) {
        if (model instanceof FakeInputModel) {
            return InputView;
        }
        return BubbleItemView;
    },

    focus(options) {
        const fakeInputModel = this.__findFakeInputModel();
        if (!fakeInputModel) {
            return;
        }
        const input = this.children.findByModel(fakeInputModel);
        if (input && input.focus) {
            input.focus(options);
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

    getInputView() {
        const fakeInputModel = this.__findFakeInputModel();
        if (fakeInputModel) {
            return this.children.findByModel(fakeInputModel);
        }
    },

    updateInput(string) {
        const input = this.getInputView();
        input && input.updateInput(string);
    },

    __findFakeInputModel() {
        return this.collection.models.find(model => model instanceof FakeInputModel && model);
    },

    childViewOptions(model) {
        if (model instanceof FakeInputModel) {
            return {
                reqres: this.reqres,
                parent: this.$el,
                readonly: !this.options.showSearch
            };
        }
        return {
            reqres: this.reqres,
            parent: this.$el,
            enabled: this.options.enabled,
            createValueUrl: this.options.createValueUrl,
            showEditButton: this.options.showEditButton,
            showRemoveButton: this.options.canDeleteItem,
            getDisplayText: this.options.getDisplayText,
            customTemplate: this.options.customTemplate
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
