import template from './templates/searchBar.hbs';
import LocalizationService from '../services/LocalizationService';
import keyCode from '../utils/keyCode';

const defaultOptions = () => ({
    placeholder: LocalizationService.get('CORE.VIEWS.SEARCHBAR.PLACEHOLDER'),
    delay: 200
});

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

    className: 'tr-search tr-search_mselect',

    ui: {
        input: '.js-search-input',
        clear: '.js-search-clear'
    },

    events: {
        'keyup @ui.input': '__trySearching',
        'pointerdown @ui.clear': '__clear',
        'focus @ui.input': 'onFocus',
        'blur @ui.input': 'onBlur'
    },

    onFocus() {
        this.el.classList.add('focused');
    },

    onBlur() {
        this.el.classList.remove('focused');
    },

    onRender() {
        if (this.options.searchText) {
            this.ui.input.val(this.options.searchText);
        }
        const value = this.ui.input.val();
        this.ui.clear.toggle(!!value);
        this.__updateInput(value);
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

    setReadonly(isEnabled) {
        if (this.isRendered()) {
            if (isEnabled) {
                this.ui.input[0].removeAttribute('readonly');
            } else {
                this.ui.input[0].setAttribute('readonly', true);
            }
        }
    },

    clearInput(isClearingSilent) {
        if (isClearingSilent) {
            this.ui.input.val('');
            this.blur();
            this.ui.clear.toggle();
            this.__updateInput();
        } else {
            this.__clear();
        }
    },

    __trySearching(event) {
        if (this.options.searchOnEnter === true) {
            if (event.keyCode === keyCode.ENTER || event.keyCode === keyCode.NUMPAD_ENTER) {
                this.__search();
            }
        } else {
            this.__search();
        }
    },

    __search() {
        const value = this.ui.input.val();
        this.__triggerSearch(value);
        this.ui.clear.toggle(!!value);
        this.__updateInput(value);
    },

    __triggerSearch(value) {
        this.trigger('search', value, { model: this.model });
    },

    __clear() {
        this.ui.input.val('');
        this.__search();
        this.ui.input.focus();
    },

    __updateInput(value) {
        this.ui.input.css('background', value ? 'none' : '');
    }
});
