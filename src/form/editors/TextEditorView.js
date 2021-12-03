import Inputmask from 'inputmask';
import BaseEditorView from './base/BaseEditorView';
import template from './templates/textEditor.hbs';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapText from './iconsWraps/iconWrapText.html';
import { keyCode } from 'utils';
import _ from 'underscore';
import { DOUBLECLICK_DELAY } from '../../Meta';

const changeMode = {
    blur: 'blur',
    keydown: 'keydown'
};

const serverMaskTypes = {
    TEL: 'PhoneRuMask',
    PASSPORT: 'PassportRuMask',
    INDEX: 'IndexRuMask',
    INN: 'INNMask',
    OGRN: 'OGRNMask',
    CUSTOM: 'CustomMask',
    EMAIL: 'EmailMask',
    LICENSE_PLATE_NUMBER_RU: 'LicensePlateNumberRuMask'
};

const defaultOptions = () => ({
    changeMode: 'blur',
    maxLength: undefined,
    showTitle: true,
    allowEmptyValue: true,
    class: undefined,
    hideClearButton: false,
    validationMaskRegex: null,
    errorMessageExpression: ''
});

/**
 * @name TextEditorView
 * @memberof module:core.form.editors
 * @class Однострочный текстовый редактор. Поддерживаемый тип данных: <code>String</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number|null} [options.maxLength=null] Максимальное количество символов. Если <code>null</code>, не ограничено.
 * @param {String} [options.changeMode='blur'] Определяет момент обновления значения редактора:<ul>
 *     <li><code>'keydown'</code> - при нажатии клавиши.</li>
 *     <li><code>'blur'</code> - при потери фокуса.</li></ul>
 * @param {String} [options.emptyPlaceholder='Field is empty'] Текст placeholder.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default formRepository.editors.Text = BaseEditorView.extend({
    initialize(options) {
        const defOps = defaultOptions();
        this.__applyOptions(options, defOps);
        this.__debounceOnClearClick = _.debounce((...args) => this.__onClearClick(...args), DOUBLECLICK_DELAY);

        this.format = options.format;
        this.isMaskFormat = Object.values(serverMaskTypes).includes(options.format);
        if (this.isMaskFormat) {
            this.__setMaskByFormat();
        }
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        clearButton: '.js-clear-button'
    },

    className: 'editor',

    template: Handlebars.compile(template),

    templateContext() {
        let type = 'text';
        if (this.format === serverMaskTypes.TEL) {
            type = 'tel';
        }
        return {
            ...this.options,
            type
        };
    },

    events() {
        const events = {
            'keyup @ui.input': '__keyup',
            'change @ui.input': '__change',
            'click @ui.clearButton': '__onClearClickHandler',
            'dblclick @ui.clearButton': '__onClearDblclick'
        };
        if (!this.options.hideClearButton) {
            events.mouseenter = '__onMouseenter';
        }
        return events;
    },

    onAttach() {
        if (this.isMaskFormat) {
            switch (this.format) {
                case serverMaskTypes.EMAIL:
                    Inputmask({ alias: 'email' }).mask(this.ui.input[0]);
                    break;
                default:
                    Inputmask({
                        regex: this.options.validationMaskRegex
                    }).mask(this.ui.input[0]);
                    break;
            }
        }
    },

    onDestroy() {
        Inputmask.remove(this.ui.input[0]);
    },

    __keyup(event) {
        if (this.options.changeMode === changeMode.keydown || event.keyCode === keyCode.ENTER) {
            this.__value(this.ui.input.val(), false, true);
        }

        this.trigger('keyup', this);
    },

    __change() {
        this.__value(this.ui.input.val(), false, true);
    },

    __onClearClick() {
        if (this.__isDoubleClicked) {
            this.__isDoubleClicked = false;
            return;
        }
        this.ui.input.focus();
        this.__value(null, true, false);
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    onRender() {
        const value = this.getValue() || '';
        this.ui.input.val(value);
        if (this.options.showTitle) {
            this.ui.input.prop?.('title', value);
        }
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.__updateEmpty();

        if (triggerChange) {
            this.__triggerChange();
        }

        if (!this.isRendered()) {
            return;
        }

        if (this.getOption('showTitle')) {
            this.ui.input.prop?.('title', value);
        }
        if (updateUi) {
            this.__updateInputValue(value);
        }
    },

    /**
     * Focuses the editor's input and selects all the text in it.
     * */
    select() {
        this.ui.input.select();
    },

    deselect() {
        this.ui.input.deselect();
    },

    __onMouseenter() {
        this.$editorEl.off('mouseenter');

        if (!this.options.hideClearButton) {
            this.renderIcons(iconWrapText, iconWrapRemove);
        }
    },

    __updateInputValue(value) {
        this.ui.input.val(value);
    },

    __setMaskByFormat() {
        const validator = {
            message: '',
            regexp: '',
            type: 'regexp'
        };

        switch (this.format) {
            case serverMaskTypes.TEL:
                this.options.validationMaskRegex = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.PHONEREGEXP');
                break;
            case serverMaskTypes.PASSPORT:
                this.options.validationMaskRegex = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.PASSPORTREGEXP');
                break;
            case serverMaskTypes.INDEX:
                this.options.validationMaskRegex = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.INDEXREGEXP');
                break;
            case serverMaskTypes.INN:
                this.options.validationMaskRegex = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.INNREGEXP');
                break;
            case serverMaskTypes.OGRN:
                this.options.validationMaskRegex = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.OGRNREGEXP');
                break;
            case serverMaskTypes.LICENSE_PLATE_NUMBER_RU:
                this.options.validationMaskRegex = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.LICENSEPLATEREGEXP');
                break;
            default:
                break;
        }
    }
});
