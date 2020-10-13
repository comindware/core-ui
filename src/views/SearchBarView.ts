import template from './templates/searchBar.hbs';
import LocalizationService from '../services/LocalizationService';
import keyCode from '../utils/keyCode';
import MobileService from '../services/MobileService';

const defaultOptions = () => ({
    placeholder: LocalizationService.get('CORE.VIEWS.SEARCHBAR.PLACEHOLDER'),
    delay: 200
});

const classes = {
    defaultSearchClass: 'tr-search tr-search_mselect',
    compactSearchClass: 'tr-search_compact',
    open: 'open',
    closed: 'closed',
    static: 'static'
};

export default Marionette.View.extend({
    initialize(options = {}) {
        _.extend(this.options, defaultOptions(), options);

        this.__triggerSearch = _.debounce(this.__triggerSearch, this.options.delay);
    },

    template: Handlebars.compile(template),

    attributes: {
        autocomplete: false
    },

    templateContext() {
        return {
            placeholder: this.options.placeholder
        };
    },

    className() { return this.__getClassName(); },

    ui: {
        input: '.js-search-input',
        clear: '.js-search-clear'
    },

    events() {
        const events = {
            'keyup @ui.input': '__onKeyup',
            'pointerdown @ui.clear': '__clear',
            'focus @ui.input': 'onFocus',
            'blur @ui.input': 'onBlur'
        };

        return events;
    },

    onFocus() {
        this.el.classList.add('focused');
        this.searchButtonIsShown = false;
    },

    onBlur() {
        this.el.classList.remove('focused');
        this.__hideSearchBar();
        if (this.searchButtonIsShown) {
            return;
        }
        this.__triggerShowSearchButton();
    },

    onRender() {
        if (this.options.isGlobalSearch === true) {
            this.$el.addClass(classes.closed);
        } else {
            this.$el.addClass(classes.static);
        }

        if (this.options.searchText) {
            this.ui.input.val(this.options.searchText);
        }
        
        const value = this.__toggleClearIcon();
        this.__updateInput(value);
    },

    toggleSearchBar(searchButtonIsHidden: Boolean) {
        searchButtonIsHidden ? this.__showSearchBar() : this.__hideSearchBar();
    },

    toggleInputActivity(inputEnabled) {
        if (inputEnabled) {
            this.setReadonly(inputEnabled);
            this.focus();
        } else {
            this.setReadonly(inputEnabled);
            this.blur();
        }
    },

    focus() {
        if (this.isRendered()) {
            this.ui.input.focus();
        }
    },

    blur() {
        if (this.isRendered()) {
            this.ui.input.blur();
        }
    },

    setReadonly(isEnabled: Boolean) {
        if (this.isRendered()) {
            if (isEnabled) {
                this.ui.input[0].removeAttribute('readonly');
            } else {
                this.ui.input[0].setAttribute('readonly', true);
            }
        }
    },

    clearInput(isClearingSilent: Boolean) {
        if (isClearingSilent) {
            const value = this.ui.input.val('');
            this.blur();
            this.__updateInput();
            this.__toggleClearIcon();
        } else {
            this.__clear();
        }
    },

    __getClassName({ searchBarIsOpen } = {}) {
        if (!searchBarIsOpen && this.options.isGlobalSearch === true) {
            return classes.compactSearchClass;
        }
        return classes.defaultSearchClass;
    },

    __onKeyup(event: KeyboardEvent) {
        this.__trySearching(event);
        this.__toggleClearIcon();
    },

    __trySearching(event: KeyboardEvent) {
        if (this.options.searchOnEnter === true) {
            if (event.keyCode === keyCode.ENTER || event.keyCode === keyCode.NUMPAD_ENTER) {
                this.__search();
            }
        } else {
            this.__search();
        }
    },

    __toggleClearIcon() {
        const value = this.ui.input.val();
        this.ui.clear.toggle(!!value);
        return value;
    },

    __showSearchBar() {
        this.$el.addClass(classes.open);
        const currentClassName = this.__getClassName({ searchBarIsOpen: true });
        this.el.className = currentClassName;
        this.__toggleClearIcon();
        this.focus();
    },

    __hideSearchBar() {
        if (this.options.isGlobalSearch === true) {
            if (!this.el.classList.contains(classes.closed)) {
                const currentClassName = this.__getClassName();
                this.el.className = currentClassName;
                this.$el.addClass(classes.closed);
            }
            this.ui.clear.toggle(false);
            this.ui.input.val('');
        }
    },

    __search() {
        const value = this.ui.input.val();
        this.__triggerSearch(value);
    },

    __triggerSearch(value) {
        this.trigger('search', value, { model: this.model });
    },

    __triggerShowSearchButton() {
        this.searchButtonIsShown = true;
        this.trigger('show:search:button');
    },

    __clear() {
        this.ui.input.val('');
        this.__toggleClearIcon();
        this.__search();
        this.ui.input.focus();
    },

    __updateInput(value) {
        this.ui.input.css('background', value ? 'none' : '');
    }
});
