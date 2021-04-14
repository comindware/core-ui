import { maskInput, emailMask } from 'lib';
import BaseEditorView from './base/BaseEditorView';
import template from './templates/textEditor.hbs';
import formRepository from '../formRepository';
import iconWrapRemove from './iconsWraps/iconWrapRemove.html';
import iconWrapText from './iconsWraps/iconWrapText.html';
import { keyCode } from 'utils';
import _ from 'underscore';
import { DOUBLECLICK_DELAY } from '../../Meta';
import PanelAutocompleteView from './PanelAutocompleteView';
import WindowService from '../../services/WindowService';
import GlobalEventService from '../../services/GlobalEventService';
import SelectableBehavior from '../../models/behaviors/SelectableBehavior';
import VirtualCollection from '../../collections/VirtualCollection';
const WINDOW_BORDER_OFFSET = 10;

const classes = {
    OPEN: 'open',
    DROPDOWN_DOWN: 'dropdown__wrp_down',
    DROPDOWN_WRP_OVER: 'dropdown__wrp_down-over',
    DROPDOWN_UP: 'dropdown__wrp_up',
    DROPDOWN_UP_OVER: 'dropdown__wrp_up-over',
    VISIBLE_COLLECTION: 'visible-collection',
    CUSTOM_ANCHOR_BUTTON: 'popout__action-btn',
    DEFAULT_ANCHOR_BUTTON: 'popout__action',
    DEFAULT_ANCHOR: 'fa fa-angle-down anchor'
};

const popoutFlow = {
    LEFT: 'left',
    RIGHT: 'right'
};

const panelPosition = {
    DOWN: 'down',
    UP: 'up'
};

const changeMode = {
    blur: 'blur',
    keydown: 'keydown'
};

const defaultOptions = () => ({
    changeMode: 'blur',
    maxLength: undefined,
    mask: undefined,
    placeholderChar: '_',
    maskOptions: {},
    showTitle: true,
    allowEmptyValue: true,
    class: undefined,
    format: 'text',
    hideClearButton: false,
    itemsAutocomplete: [],
    autocomplete: false,
    showTitle: true
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
 * @param {String} [options.format=''] ('email'/'tel') set the predefined input mask, validator and type for input.
 * @param {String} [options.mask=null] Если установлено, строка используется как опция <code>mask</code> плагина
 * [jquery.inputmask](https://github.com/RobinHerbots/jquery.inputmask).
 * @param {String} [options.placeholderChar='_'] При установленной опции <code>mask</code>, используется как опция placeholder плагина.
 * @param {Object} [options.maskOptions={}] При установленной опции <code>mask</code>, используется для передачи дополнительных опций плагина.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default formRepository.editors.Text = BaseEditorView.extend({
    initialize(options) {
        const defOps = defaultOptions();
        if (options.format) {
            this.__setMaskByFormat(options.format, defOps);
        } else {
            this.mask = this.options.mask;
        }

        this.__applyOptions(options, defOps);
        if (this.options.autocomplete) {
            this.collection = this.options.itemsAutocomplete;
            this.__createPanelVirtualCollection();
            this.__createSelectedCollections();
        }
        this.__debounceOnClearClick = _.debounce((...args) => this.__onClearClick(...args), DOUBLECLICK_DELAY);
    },

    focusElement: '.js-input',

    ui: {
        input: '.js-input',
        clearButton: '.js-clear-button'
    },

    className: 'editor',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            ...this.options,
            type: this.options.format === 'tel' ? 'tel' : 'text'
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

    __open(event) {
        if (this.isOpen && [keyCode.UP, keyCode.DOWN, keyCode.ENTER].includes(event.keyCode)) {
            this.panelKeydown(event);
            return;
        }
        if (!this.isOpen) {
            this.panelView = new PanelAutocompleteView({ collection: this.panelCollection });
            this.panelEl = this.panelView.el;
            this.popupId = WindowService.showTransientPopup(this.panelView, {
                hostEl: this.ui.input[0]
            });
            GlobalEventService.on('window:mousedown:captured', this.__handleGlobalMousedown.bind(this));
            this.__adjustPosition();
            this.isOpen = true;
            this.listenTo(this.panelCollection, 'selected', this.__onPanelSelected);
            this.listenTo(this.panelCollection, 'deselected', this.__onPanelDeselected);
        } else {
            const inputValue = this.ui.input.val().trim();
            this.__filterPanelCollection(inputValue);
        }
    },

    __keyup(event) {
        if (this.options.autocomplete) {
            this.__open(event);
        }
        if (this.options.changeMode === changeMode.keydown || event.keyCode === keyCode.ENTER) {
            this.__value(this.ui.input.val(), false, true);
        }
        this.trigger('keyup', this);
    },

    __handleGlobalMousedown(target) {
        if (this.__isNestedInPanel(target)) {
            this.__suppressHandlingBlur = true;
        } else if (!this.__isNestedInButton(target)) {
            this.close();
        }
    },

    __isNestedInButton(testedEl) {
        return this.ui.input[0] === testedEl || this.ui.input[0].contains(testedEl);
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

    __createPanelVirtualCollection() {
        let collection = this.collection;
        if (!(collection instanceof Backbone.Collection)) {
            collection = new Backbone.Collection(collection);
        }
        this.panelCollection = new VirtualCollection(collection, {
            isSliding: true,
            selectableBehavior: 'multi'
        });
        this.listenTo(this.panelCollection, 'filter', () => {
            this.__tryPointFirstRow();
            this.__updateSelectedOnPanel();
        });
    },

    __updateSelectedOnPanel() {
        this.panelCollection.selected = {};

        if (this.panelCollection.length > 0 && this.value) {
            this.__setValueToPanelCollection(this.value);
        }
    },

    __value(value, updateUi, triggerChange) {
        let realValue = value;
        if (!updateUi && value && this.options.format === 'tel') {
            realValue = realValue.replace(/[^\d]/g, '');
        }
        if (this.value === realValue) {
            return;
        }
        this.value = realValue;
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
            this.ui.input.val(value);
        }
    },

    __onPanelSelected(model) {
        const value = model.get('text');
        this.__value(value, true, true);
        this.close();
    },

    __onPanelDeselected() {
        this.close();
    },

    __onMouseenter() {
        this.$editorEl.off('mouseenter');

        if (!this.options.hideClearButton) {
            this.renderIcons(iconWrapText, iconWrapRemove);
        }
    },

    __createSelectedCollections() {
        const selectedCollection = (this.selectedCollection = new Backbone.Collection());
        this.selectedCollection.model = Backbone.Model.extend({
            initialize() {
                this.selectableCollection = selectedCollection;
                _.extend(this, new SelectableBehavior.Selectable(this));
            }
        });

        _.extend(this.selectedCollection, new SelectableBehavior.SingleSelect(this.selectedCollection));

        if (this.isButtonLimitMode) {
            this.selectedButtonCollection = new Backbone.Collection();
            this.selectedPanelCollection = new Backbone.Collection();
        }
    },

    __adjustPosition() {
        if (!this.panelEl) {
            return;
        }
        this.panelEl.style.height = '';
        const viewportHeight = window.innerHeight;
        const input = this.ui.input[0];
        const inputRect = input.getBoundingClientRect();
        const bottom = viewportHeight - inputRect.top - inputRect.height;

        const minWidth = inputRect.width;
        this.panelEl.style.minWidth = `${minWidth}px`;

        const viewport = {
            height: window.innerHeight,
            width: window.innerWidth
        };

        const panelRect = this.panelEl.getBoundingClientRect();

        this.panelEl.style.width = `${panelRect.width}px`;

        let right;

        const anchorRightCenter = viewport.width - (inputRect.left + inputRect.width);
        if (anchorRightCenter < WINDOW_BORDER_OFFSET) {
            right = WINDOW_BORDER_OFFSET;
        } else if (anchorRightCenter + panelRect.width > viewport.width - WINDOW_BORDER_OFFSET) {
            right = viewport.width - WINDOW_BORDER_OFFSET - panelRect.width;
        } else {
            right = anchorRightCenter;
        }
        this.panelEl.style.right = `${right}px`;

        // class adjustments
        this.panelEl.classList.add(classes.FLOW_LEFT);
        this.panelEl.classList.remove(classes.FLOW_RIGHT);

        // class adjustments
        this.panelEl.classList.add(classes.DROPDOWN_DOWN);
        this.panelEl.classList.remove(classes.DROPDOWN_UP);

        const offsetHeight = this.panelEl.offsetHeight;

        // panel positioning
        let top = inputRect.top + inputRect.height;

        // trying to fit into viewport
        if (top + offsetHeight > viewportHeight - WINDOW_BORDER_OFFSET) {
            top = viewportHeight - WINDOW_BORDER_OFFSET - offsetHeight; // todo add border offset
            if (offsetHeight + WINDOW_BORDER_OFFSET > bottom) {
                const diff = offsetHeight + WINDOW_BORDER_OFFSET - bottom;
                top += diff;
                this.panelEl.style.height = `${offsetHeight + WINDOW_BORDER_OFFSET - diff}px`;
            }
        }
        if (top <= WINDOW_BORDER_OFFSET) {
            top = WINDOW_BORDER_OFFSET;

            if (offsetHeight > inputRect.top) {
                const diff = offsetHeight - inputRect.top;
                this.panelEl.style.height = `${offsetHeight - diff}px`;
            }
        }

        this.panelEl.style.top = `${top}px`;
    },

    __setMaskByFormat(format, defaults) {
        let additionalValidator;
        switch (format) {
            case 'email':
                this.mask = emailMask;
                additionalValidator = 'email';
                defaults.emptyPlaceholder = Localizer.get('CORE.FORM.EDITORS.TEXTEDITOR.EMAILPLACEHOLDER');
                break;
            case 'tel':
                this.mask = [/[1-9]/, ' ', '(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
                defaults.emptyPlaceholder = '5 (555) 555-55-55';
                this.options.maskOptions = {
                    guide: true
                };
                additionalValidator = 'phone';
                break;
            default:
                break;
        }
        if (additionalValidator) {
            if (this.validators) {
                this.validators.push(additionalValidator);
            } else {
                this.validators = [additionalValidator];
            }
        }
    },

    __isNestedInPanel(testedEl) {
        const palet = document.getElementsByClassName('sp-container')[0]; //Color picker custom el container;
        return WindowService.get(this.popupId).some(x => x.el.contains(testedEl) || this.ui.input[0].contains(testedEl)) || (palet && palet.contains(testedEl));
    },

    __onEnterValueSelect(event) {
        if (this.isOpen) {
            const lastPointedModel = this.panelCollection.lastPointedModel;
            if (lastPointedModel && !lastPointedModel.selected) {
                this.panelCollection.lastPointedModel.toggleSelected();
            }
            this.__value(this.panelCollection.lastPointedModel.get('text'), true, false);
            this.close();
            stop(event);
        }
    },

    __getDisplayText(value, displayAttribute = this.options.displayAttribute) {
        if (value == null) {
            return '';
        }
        const attributes = this.__getAttributes(value);
        if (typeof displayAttribute === 'function') {
            return displayAttribute(attributes, this.model);
        }
        return attributes[displayAttribute] || attributes.text || `#${attributes[this.options.idProperty]}`;
    },

    __getAttributes(model) {
        return model instanceof Backbone.Model ? model.toJSON() : model;
    },

    _updateSelectedOnPanel() {
        this.panelCollection.selected = {};
        if (this.panelCollection.length > 0 && this.value) {
            if (this.options.maxQuantitySelected === 1) {
                if (this.options.showCheckboxes) {
                    if (this.options.storeArray && Array.isArray(this.value)) {
                        this.value.forEach(value => this.__setValueToPanelCollection(value));
                    } else {
                        this.__setValueToPanelCollection(this.value);
                    }
                }
            } else {
                this.value.forEach(value => this.__setValueToPanelCollection(value));
            }
        }
    },

    __setValueToPanelCollection(value) {
        const id = value && value[this.options.idProperty] !== undefined ? value[this.options.idProperty] : value;
        this.panelCollection.get(id)?.select({ isSilent: true });
    },

    __getSelectedBubble() {
        return this.selectedCollection.getSelected();
    },

    __tryPointFirstRow() {
        if (this.panelCollection.length) {
            this.__getSelectedBubble()?.deselect();
            this.panelCollection.selectSmart(this.panelCollection.at(0), false, false, false);
        } else {
            this.panelCollection.pointOff();
        }
    },

    __filterPanelCollection(searchText) {
        const filter = attributes => {
            const displayText = this.__getDisplayText(attributes);
            if (!displayText) {
                return false;
            }
            return displayText.toUpperCase().startsWith(searchText.toUpperCase());
        };

        this.panelCollection.filter(filter);
    },

    onAttach() {
        if (this.mask) {
            this.maskedInputController = maskInput({
                inputElement: this.ui.input[0],
                mask: this.mask,
                placeholderChar: this.options.placeholderChar,
                autoUnmask: true,
                ...(this.options.maskOptions || {})
            });
        }
    },

    onDestroy() {
        this.maskedInputController && this.maskedInputController.destroy();
    },

    onRender() {
        const value = this.getValue() || '';
        this.ui.input.val(value);
        if (this.options.showTitle) {
            this.ui.input.prop?.('title', value);
        }
    },

    setValue(value) {
        this.__value(value, true, false);
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

    close() {
        this.isOpen = false;
        this.stopListening(this.panelCollection, 'selected', this.__onPanelSelected);
        this.stopListening(this.panelCollection, 'deselected', this.__onPanelDeselected);
        WindowService.closePopup(this.popupId);
    },

    moveCursorBy(delta) {
        if (!this.isOpen) {
            return;
        }
        this.panelCollection.trigger('moveCursorBy', delta, { isLoop: false, shiftPressed: false });
    },

    panelKeydown(e) {
        switch (e.keyCode) {
            case keyCode.DOWN:
                stop(e);
                this.moveCursorBy(1);
                break;
            case keyCode.UP:
                stop(e);
                this.moveCursorBy(-1);
                break;
            case keyCode.ENTER:
                this.__onEnterValueSelect(e);
                break;
            default:
                break;
        }
    }
});
