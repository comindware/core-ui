/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import { helpers } from 'utils';
import template from '../templates/multiSelectPanel.hbs';
import MultiSelectItemView from './MultiSelectItemView';

const checkedState = {
    checked: 'checked',
    unchecked: 'unchecked',
    checkedSome: 'checkedSome'
};

const checkBoxClasses = {
    checked: 'editor_checked',
    checkedSome: 'editor_checked_some'
};

export default Marionette.CompositeView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'model');
        this.collection = this.model.get('collection');
        this.listenTo(this.collection, 'select deselect', this.__checkSelectState);
    },

    className: 'multiselect-panel',

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            explicitApply: this.getOption('explicitApply')
        };
    },

    childView: MultiSelectItemView,

    childViewOptions() {
        return {
            displayAttribute: this.getOption('displayAttribute')
        };
    },

    childViewContainer: '.js-list',

    ui: {
        checkbox: '.js-header-checkbox',
        apply: '.js-apply',
        cancel: '.js-cancel',
        close: '.js-close'
    },

    events: {
        'click @ui.checkbox': '__toggleSelection',
        'click @ui.apply': '__apply',
        'click @ui.cancel': '__close',
        'click @ui.close': '__close'
    },

    onShow() {
        this.$el.focus();
    },

    __checkSelectState() {
        if (this.collection.models.every(model => model.selected === true)) {
            this.__setCheckBoxAll();
        } else if (this.collection.models.some(model => model.selected === true)) {
            this.__setCheckBoxSome();
        } else {
            this.__setCheckBoxNone();
        }
    },

    __toggleSelection() {
        if (this.checkedState !== checkedState.checked) {
            this.__selectAll();
        } else {
            this.__deselectAll();
        }
        return false;
    },

    __setCheckBoxAll() {
        this.checkedState = checkedState.checked;
        this.ui.checkbox.addClass(checkBoxClasses.checked);
        this.ui.checkbox.removeClass(checkBoxClasses.checkedSome);
    },

    __setCheckBoxNone() {
        this.checkedState = checkedState.unchecked;
        this.ui.checkbox.removeClass(checkBoxClasses.checked);
        this.ui.checkbox.removeClass(checkBoxClasses.checkedSome);
    },

    __setCheckBoxSome() {
        this.checkedState = checkedState.checkedSome;
        this.ui.checkbox.removeClass(checkBoxClasses.checked);
        this.ui.checkbox.addClass(checkBoxClasses.checkedSome);
    },

    __selectAll() {
        this.trigger('select:all');
    },

    __deselectAll() {
        this.trigger('deselect:all');
    },

    __apply() {
        this.trigger('apply');
    },

    __close() {
        this.trigger('close');
    }
});
