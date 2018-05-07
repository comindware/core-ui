// @flow
import template from '../templates/button.hbs';
import BubbleItemView from './BubbleItemView';
import InputView from './InputView';
import FakeInputModel from '../models/FakeInputModel';

const classes = {
    CLASS_NAME: 'bubbles',
    DISABLED: ' disabled'
};

export default Marionette.CollectionView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.collection = this.model.selected;
    },

    template: Handlebars.compile(template),

    className() {
        return classes.CLASS_NAME + (this.options.enabled ? '' : classes.DISABLED);
    },

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

    events: {
        click: '__click'
    },

    tagName: 'ul',

    childViewOptions() {
        return {
            reqres: this.reqres,
            parent: this.$el,
            enabled: this.options.enabled,
            createValueUrl: this.options.createValueUrl,
            showEditButton: this.options.showEditButton,
            getDisplayText: this.options.getDisplayText
        };
    },

    __click() {
        this.reqres.request('button:click');
    },

    updateEnabled(enabled) {
        this.children.each(cv => {
            if (cv.updateEnabled) {
                cv.updateEnabled(enabled);
            }
        });
    },

    onAddChild() {
        this.trigger('change:content');
    },

    onRemoveChild() {
        this.trigger('change:content');
    }
});
