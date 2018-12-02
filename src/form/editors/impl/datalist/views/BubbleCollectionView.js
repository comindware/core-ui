// @flow
import template from '../templates/button.hbs';
import InputView from './InputView';
import FakeInputModel from '../models/FakeInputModel';
import LoadingView from './LoadingView';
import iconWrapPencil from '../../../iconsWraps/iconWrapPencil.html';
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';

const classes = {
    DISABLED: ' disabled'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.collection = options.collection;

        this.listenTo(this.collection, 'add:child remove:child', () => this.trigger('change:content'));
    },

    className() {
        return `bubbles__list ${this.options.enabled ? '' : classes.DISABLED}`;
    },

    regions: {
        loadingRegion: '.js-datalist-loading-region',
        searchRegion: '.js-datalist-search-region'
    },

    templateContext() {
        return {
            items: this.collection.toJSON()
        };
    },

    ui: {
        clearButton: '.js-bubble-delete',
        editButton: '.js-edit-button',
        bubble: '.bubbles__i'
    },

    events: {
        'click @ui.clearButton': '__delete',
        'click @ui.editButton': '__edit',
        click: '__click',
        drag: '__handleDrag',
        'mouseenter @ui.bubble': '__onMouseenter',
        'mouseleave @ui.bubble': '__onMouseleave'
    },

    onRender() {
        this.showChildView('searchRegion', new InputView({ model: new FakeInputModel() }));
    },

    __click() {
        this.reqres.request('button:click');
    },

    template: Handlebars.compile(template),

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

    updateEnabled(enabled) {
        this.options.enabled = enabled;
    },

    setLoading(state) {
        if (this.isDestroyed()) {
            return;
        }

        if (state) {
            this.showChildView('loadingRegion', new LoadingView());
        } else {
            this.getRegion('loadingRegion').reset();
        }
    },

    __onMouseenter(event) {
        if (this.options.showEditButton) {
            event.currentTarget.insertAdjacentHTML('beforeend', iconWrapPencil);
        }
        if (this.options.enabled && this.options.showRemoveButton) {
            event.currentTarget.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
        }
    },

    __onMouseleave(event) {
        if (this.options.showEditButton) {
            event.currentTarget.removeChild(event.currentTarget.lastElementChild);
        }
        if (this.options.enabled && this.options.showRemoveButton) {
            event.currentTarget.removeChild(event.currentTarget.lastElementChild);
        }
    }
});
