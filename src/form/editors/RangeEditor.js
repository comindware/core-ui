// @flow
import BaseEditorView from './base/BaseEditorView';
import formRepository from '../formRepository';

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

export default (formRepository.editors.RangeEditor = BaseEditorView.extend({
        tagName: 'input',

        template: _.noop,

        templateContext() {
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

        attributes() {
            return {
                min: this.getOption('min'),
                max: this.getOption('max'),
                step: this.getOption('step'),
                type: 'range'
            };
        },

        __change() {
            this.__value(Number(this.el.value), false, true);
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
    }
));
