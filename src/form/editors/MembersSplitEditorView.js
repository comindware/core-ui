// @flow
import template from './templates/membersSplitPanelEditor.html';
import MembersSplitController from './impl/membersSplit/controller/MembersSplitController';
import formRepository from '../formRepository';
import BaseEditorView from './base/BaseEditorView';
import WindowService from '../../services/WindowService';

// used as function because Localization service is not initialized yet
const defaultOptions = () => ({
    exclude: [],
    displayText: '',
    hideUsers: false,
    hideGroups: false,
    hideToolbar: false,
    maxQuantitySelected: null,
    allowRemove: true,
    title: '',
    itemsToSelectText: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.USERSTOSELECT'),
    selectedItemsText: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.SELECTEDUSERS'),
    searchPlaceholder: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.SEARCHUSERS'),
    emptyListText: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.EMPTYLIST'),
    users: [],
    groups: [],
    showMode: null,
    memberService: undefined,
    getDisplayText: null
});

export default (formRepository.editors.MembersSplit = BaseEditorView.extend({
    initialize(options = {}) {
        this.__applyOptions(options, defaultOptions);
        this.__initializeController(options);
    },

    className: 'member-split',

    regions: {
        splitPanelRegion: {
            el: '.js-split-panel-region',
            replaceElement: true
        }
    },

    ui: {
        membersEditor: '.js-members-editor',
        membersText: '.js-members-text'
    },

    events: {
        'click @ui.membersEditor': '__showPopup'
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            displayText: this.options.displayText,
            showButton: this.getOption('showMode') === 'button'
        };
    },

    setValue(value) {
        this.__value(value, false);
    },

    isEmptyValue() {
        return !this.value?.length;
    },

    onRender() {
        if (this.getOption('showMode') !== 'button') {
            this.controller.initItems();

            this.showChildView('splitPanelRegion', this.controller.view);
        }
    },

    reloadCollection(users: Array<{ id: string, name: string }>, groups: Array<{ id: string, name: string }>): void {
        this.options.users = users;
        this.options.groups = groups;
        this.controller.fillInModel();
        this.controller.initItems();
    },

    __initializeController(options) {
        this.options.selected = this.getValue();

        this.controller = new MembersSplitController(this.options);
        if (this.getOption('showMode') !== 'button') {
            this.controller.on('popup:ok', () => {
                this.__value(this.options.selected, true);
            });
        }
    },

    __showPopup() {
        if (!this.getEditable()) {
            return;
        }
        this.options.selected = this.getValue();
        this.controller.initItems();

        const popup = new Core.layout.Popup({
            size: {
                width: '980px',
                height: '700px'
            },
            header: this.getOption('title') || Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.MEMBERSTITLE'),
            buttons: [
                {
                    id: false,
                    text: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.CANCEL'),
                    customClass: 'btn-small btn-outline',
                    handler: () => {
                        this.controller.cancelMembers();
                        Core.services.WindowService.closePopup();
                    }
                },
                {
                    id: 'save',
                    text: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.APPLY'),
                    customClass: 'btn-small',
                    handler: () => {
                        this.controller.updateMembers();
                        this.__value(this.options.selected, true);
                        Core.services.WindowService.closePopup();
                    }
                }
            ],
            content: this.controller.view
        });

        WindowService.showPopup(popup);
    },

    async updateText() {
        this.ui.membersText.text(await this.controller.getDisplayText());
    },

    __value(value, triggerChange) {
        this.options.selected = value;
        if (this.getOption('showMode') === 'button') {
            this.updateText();
        }
        this.value = value;

        if (triggerChange) {
            this.__triggerChange();
        }
    }
}));
