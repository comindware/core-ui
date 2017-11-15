
import template from './templates/workSpaceItemSplitEditor.hbs';
import formRepository from '../formRepository';
import WorkItemsController from './impl/workItemsSplit/controller/WorkItemSplitController';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import WindowService from '../../services/WindowService';

const defaultOptions = {
    exclude: [],
    maxQuantitySelected: undefined,
    allowRemove: true
};

formRepository.editors.WorkItemsSplit = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, _.keys(defaultOptions)), defaultOptions);

        this.options.selected = this.getValue();
        this.options.orderEnabled = true;

        this.controller = new WorkItemsController(this.options);
        this.controller.on('popup:ok', () => {
            this.__value(this.options.selected, true);
        });
    },

    focusElement: null,

    ui: {
        workItemsEditor: '.js-workspaceitems-editor',
        workItemsText: '.js-workspaceitems-text'
    },

    events: {
        'click @ui.workItemsEditor': '__showPopup'
    },

    className: 'work-items-editor',

    template: Handlebars.compile(template),

    setValue(value) {
        this.__value(value, false);
    },

    __showPopup() {
        if (!this.getEnabled()) {
            return;
        }
        this.controller.initItems();
        WindowService.showPopup(this.controller.view);
    },

    __value(value, triggerChange) {
        this.value = value;
        if (triggerChange) {
            this.__triggerChange();
        }
    }
});

export default formRepository.editors.WorkItemsSplit;
