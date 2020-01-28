import template from './templates/membersSplitPanelEditor.html';
import MembersSplitController from './impl/membersSplit/controller/MembersSplitController';
import formRepository from '../formRepository';
import BaseEditorView from './base/BaseEditorView';
import WindowService from '../../services/WindowService';

// used as function because Localization service is not initialized yet
const defaultOptions = () => ({
    filterFnParameters: { users: undefined, groups: undefined },
    memberTypes: { users: undefined, groups: undefined },
    exclude: [],
    displayText: '',
    hideUsers: false,
    hideGroups: false,
    hideToolbar: false,
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
    getDisplayText: null,
    textFilterDelay: 500
});

export default (formRepository.editors.MembersSplit = BaseEditorView.extend({
    initialize(options = {}) {
        this.__applyOptions(options, defaultOptions);
        this.__initializeController(this.options);
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
        this.controller.updateItems(this.controller.filterState, value);
        this.__value(value, false);
    },

    isEmptyValue() {
        return !this.value?.length;
    },

    onRender() {
        if (this.getOption('showMode') !== 'button') {
            this.showChildView('splitPanelRegion', this.controller.view);
        } else {
            this.__updateText(Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.EMPTYTEXT'));
        }
    },

    reloadCollection(users: Array<{ id: string, name: string }>, groups: Array<{ id: string, name: string }>): void {
        this.options.users = users;
        this.options.groups = groups;
        this.setValue([]);
    },

    __initializeController(options) {
        if (options.memberService) {
            Object.assign(this.options, {
                filterFnParameters: options.memberService.filterFnParameters,
                memberTypes: options.memberService.memberTypes
            });
        }

        this.controller = new MembersSplitController(this.options);
        if (this.getOption('showMode') !== 'button') {
            this.controller.createView();
            this.controller.on('popup:ok', () => {
                this.__value(this.options.selected, true);
            });
        }
        this.listenTo(this.controller, 'update:text', this.__updateText);
    },

    __showPopup() {
        if (!this.getEditable()) {
            return;
        }
        this.options.selected = this.getValue();
        this.controller.createView();
        this.controller.processValues();

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
                        this.controller.saveMembers();
                        this.__value(this.options.selected, true);
                        Core.services.WindowService.closePopup();
                    }
                }
            ],
            content: this.controller.view
        });

        WindowService.showPopup(popup);
    },

    __updateText(text: String) {
        this.ui.membersText.text(text);
    },

    __value(value, triggerChange) {
        this.options.selected = value;
        this.value = value;

        if (triggerChange) {
            this.__triggerChange();
        }
    }
}));
