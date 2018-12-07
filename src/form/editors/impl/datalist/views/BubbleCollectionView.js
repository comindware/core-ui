// @flow
import template from '../templates/button.hbs';
import InputView from './InputView';
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
        this.listenTo(this.collection, 'add:child remove:child reset', this.render);
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
            items: this.collection.toJSON(),
            hidden: !this.options.showSearch
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
        if (this.options.showSearch) {
            this.searchInputView = new InputView({ text: this.options.searchText, reqres: this.reqres });
            this.showChildView('searchRegion', this.searchInputView);
        }
    },

    __click(e) {
        if (e.target.tagName === 'A') {
            e.stopPropagation();
            return;
        }
        this.reqres.request('button:click');
    },

    template: Handlebars.compile(template),

    focus(options) {
        this.searchInputView?.focus(options);
    },

    blur() {
        this.searchInputView?.blur();
    },

    updateInput(string) {
        this.searchInputView?.updateInput(string);
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

    setReadonly(...args) {
        this.searchInputView.setReadonly(...args);
    },

    setEnabled(...args) {
        this.searchInputView.setEnabled(...args);
    },

    __onMouseenter(event) {
        if (this.options.showEditButton) {
            event.currentTarget.insertAdjacentHTML('beforeend', iconWrapPencil);
        }
        if (this.options.enabled && this.options.canDeleteItem) {
            event.currentTarget.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
        }
    },

    __onMouseleave(event) {
        if (this.options.showEditButton) {
            event.currentTarget.removeChild(event.currentTarget.lastElementChild);
        }
        if (this.options.enabled && this.options.canDeleteItem) {
            event.currentTarget.removeChild(event.currentTarget.lastElementChild);
        }
    },

    __delete(event) {
        this.reqres.request('bubble:delete', this.collection.at(Array.prototype.indexOf.call(event.delegateTarget.children, event.currentTarget.parentElement)));
        return false;
    },

    __edit(event) {
        if (this.reqres.request('value:edit', this.collection.at(Array.prototype.indexOf.call(event.delegateTarget.children, event.currentTarget.parentElement)).attributes)) {
            return false;
        }
        return null;
    }
});
