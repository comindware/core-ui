
import BaseItemEditorView from './base/BaseItemEditorView';
import formRepository from '../formRepository';

const defaultOptions = () => ({
    changeMode: 'blur',
    showTitle: true,
    min: 1,
    max: 100,
    step: 1
});

/**
 * @name RangeView
 * @memberof module:core.form.editors
 * @class Slider editor. Supported data type: <code>Number</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number|null} [options.min=1] Minimal value of the slider.
 * @param {Number|null} [options.max=100] Maximum value of the slider.
 * @param {Number|null} [options.step=1] Change step of the slider.
 * @param {Boolean} {options.showTitle=true} Whether to show title attribute.
 * */

export default formRepository.editors.ColorPicker = BaseItemEditorView.extend(/** @lends module:core.form.editors.ColorPickerView.prototype */{
    initialize(options = {}) {
        const defOps = defaultOptions();
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, _.keys(defOps)), defOps);

        this.placeholder = this.options.emptyPlaceholder;
    },

    onShow() {
        if (this.options.mask) {
            this.ui.input.inputmask(_.extend({
                mask: this.options.mask,
                placeholder: this.options.maskPlaceholder,
                autoUnmask: true
            }, this.options.maskOptions || {}));
        }
    },

    tagName: 'input',

    template: false,

    templateHelpers() {
        return _.extend(this.options, {
            title: this.value || ''
        });
    },

    setValue(value) {
        this.__value(value, true, false);
    },

    events: {
        mouseup: '__change'
    },

    setPermissions(enabled, readonly) {
        BaseItemEditorView.prototype.setPermissions.call(this, enabled, readonly);
        this.setPlaceholder();
    },

    setPlaceholder() {
        if (!this.getEnabled() || this.getReadonly()) {
            this.placeholder = '';
        } else {
            this.placeholder = this.options.emptyPlaceholder;
        }
    },

    attributes() {
        return {
            min: this.getOption('min'),
            max: this.getOption('max'),
            step: this.getOption('step'),
            type: 'range'
        };
    },

    __keyup() {
        this.trigger('keyup', this);
    },

    __change() {
        this.__value(Number(this.el.value), false, true);
    },

    __setEnabled(enabled) {
        BaseItemEditorView.prototype.__setEnabled.call(this, enabled);
    },

    onRender() {
        this.el.value = this.getOption('value');
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;

        if (triggerChange) {
            this.__triggerChange();
        }
    }
});
