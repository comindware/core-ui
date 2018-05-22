// @flow
import template from './templates/membersSplitPanelEditor.html';
import MembersSplitController from './impl/membersSplit/controller/MembersSplitController';
import formRepository from '../formRepository';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
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
    users: undefined,
    groups: undefined,
    showMode: null,
    cacheService: undefined
});

export default (formRepository.editors.MembersSplit = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions())), defaultOptions());

        const defOps = Object.assign(defaultOptions(), {
            users: options.users ||
                options.cacheService.GetUsers().map(user => ({
                    id: user.Id,
                    name: user.Text || user.Username,
                    abbreviation: user.abbreviation,
                    userpicUri: user.userpicUri,
                    type: 'users'
                })),
            groups: options.groups ||
                options.cacheService.GetGroups().map(group => ({
                    id: group.id,
                    name: group.name,
                    type: 'groups'
                }))
        });

        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defOps)), defOps);

        this.options.selected = this.getValue();

        this.controller = new MembersSplitController(this.options);
        if (this.getOption('showMode') !== 'button') {
            this.controller.on('popup:ok', () => {
                this.__value(this.options.selected, true);
                this.__updateEditor();
            });
        }
    },

    className: 'member-split',

    focusElement: null,

    attributes: {
        tabindex: 0
    },

    regions: {
        splitPanelRegion: '.js-split-panel-region'
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

    onRender() {
        if (this.getOption('showMode') !== 'button') {
            this.controller.initItems();

            this.showChildView('splitPanelRegion', this.controller.view);
        }
    },

    __showPopup() {
        if (!this.getEnabled()) {
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
            buttons: [{
                id: 'save',
                text: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.APPLY'),
                handler: () => {
                    this.controller.updateMembers();
                    this.__value(this.options.selected, true);
                    this.__updateEditor();
                    Core.services.WindowService.closePopup();
                }
            },
            {
                id: 'close',
                text: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.CANCEL'),
                handler: () => {
                    this.controller.cancelMembers();
                    Core.services.WindowService.closePopup();
                }
            }
            ],
            content: this.controller.view
        });

        WindowService.showPopup(popup);
    },

    __updateEditor() {
        this.ui.membersText.text(this.options.displayText);
    },

    __value(value, triggerChange) {
        this.value = value;

        if (triggerChange) {
            this.__triggerChange();
        }
    }
}));
