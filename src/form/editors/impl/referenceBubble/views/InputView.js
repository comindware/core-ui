
import LocalizationService from '../../../../../services/LocalizationService';
import template from '../templates/input.hbs';

const classes = {
    EMPTY: ' empty'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.parent = options.parent;

        this.fetchDelayId = _.uniqueId('fetch-delay-id-');

        this.filterValue = '';
    },

    template: Handlebars.compile(template),

    tagName: 'li',

    className: 'bubbles__form',

    ui: {
        input: '.js-input'
    },

    focusElement: '.js-input',

    events: {
        'keyup @ui.input': '__search',
        'input @ui.input': '__search'
    },

    modelEvents: {
        'change:empty': '__updateInputPlaceholder'
    },

    onRender() {
        this.updateInput();
        this.__updateInputPlaceholder();
    },

    focus() {
        this.ui.input.focus();
    },

    keyboardShortcuts: { //todo use this
        up() {
            this.reqres.request('input:up');
        },
        down() {
            this.reqres.request('input:down');
        },
        'enter,num_enter'() {
            this.reqres.request('value:select');
        }
    },

    __getFilterValue() {
        return this.ui.input.val().toLowerCase().trim() || '';
    },

    updateInput(value = '') {
        this.ui.input.val(value);
        this.__updateInputWidth(this.__calculateDesiredInputWidth(value));
    },

    __search(e) {
        const value = this.__getFilterValue();

        if (e.keyCode === 8) {
            if (value.length === 0) {
                if (!this.options.enabled) {
                    return;
                }
                this.reqres.request('bubble:delete:last');
            }
        } else {
            if (this.filterValue === value) {
                return;
            }
            this.__updateInputWidth(this.__calculateDesiredInputWidth(value || this.ui.input.attr('placeholder')));
            this.filterValue = value;
            this.reqres.request('input:search', value, false);
        }
    },

    __calculateDesiredInputWidth(value) {
        let styleBlock = 'position:absolute; left: -1000px; top: -1000px; display:none;';

        const parentWidth = this.parent.outerWidth();
        let style;
        const styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
        let width;
        let i;

        for (i = 0; i < styles.length; i++) {
            style = styles[i];
            styleBlock += `${style}:${this.ui.input.css(style)};`;
        }

        document.body.insertAdjacentHTML('beforeend', `<div id="calculation-input-reference-editor" style=${styleBlock}>${value}</div>`);

        width = document.getElementById('calculation-input-reference-editor').getBoundingClientRect().width + 25;
        document.body.removeChild(document.getElementById('calculation-input-reference-editor'));
        if (parentWidth !== 0 && (width > parentWidth - 10)) {
            width = parentWidth - 10;
        }
        return width;
    },

    __updateInputWidth(width) {
        this.ui.input.css({ width: `${width}px` });
    },

    __updateInputPlaceholder() {
        const empty = this.model.get('empty');
        const placeholder = empty ? LocalizationService.get('CORE.FORM.EDITORS.BUBBLESELECT.NOTSET') : '';
        this.__updateInputWidth(this.__calculateDesiredInputWidth(placeholder));
        this.ui.input.attr({ placeholder }).toggleClass(classes.EMPTY, empty);
    }
});
