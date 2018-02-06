
import template from './templates/membersSplitEditor.hbs';
import MemberSplitController from './impl/membersSplit/controller/MemberSplitController';
import formRepository from '../formRepository';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import WindowService from '../../services/WindowService';
import LocalizationService from '../../services/LocalizationService';

// used as function because Localization service is not initialized yet
const defaultOptions = () => ({
    exclude: [],
    displayText: '',
    hideUsers: false,
    hideGroups: false,
    maxQuantitySelected: undefined,
    allowRemove: true,
    title: '',
    itemsToSelectText: LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.USERSTOSELECT'),
    selectedItemsText: LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.SELECTEDUSERS'),
    searchPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.SEARCHUSERS'),
    emptyListText: LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.EMPTYLIST')
});

export default formRepository.editors.MembersSplit = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        const defOps = Object.assign(defaultOptions(), {
            users: options.schema.cacheService.GetUsers().map(user => ({
                id: user.Id,
                name: (user.Text || user.Username),
                abbreviation: user.abbreviation,
                userpicUri: user.userpicUri,
                type: 'users'
            })),
            groups: options.schema.cacheService.GetGroups().map(group => ({
                id: group.id,
                name: group.name,
                type: 'groups'
            }))
        });

        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defOps)), defOps);

        const value = this.getValue();
        this.options.selected = typeof value === 'string' ? [value] : value;

        this.controller = new MemberSplitController(this.options);
        this.controller.on('popup:ok', () => {
            this.__value(this.options.selected, true);
            this.__updateEditor();
        });
    },

    focusElement: null,

    attributes: {
        tabindex: 0
    },

    ui: {
        membersEditor: '.js-members-editor',
        membersText: '.js-members-text'
    },

    events: {
        'click @ui.membersEditor': '__showPopup'
    },

    className: 'members-editor',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            displayText: this.options.displayText
        };
    },

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

    __updateEditor() {
        this.ui.membersText.text(this.options.displayText);
    },

    __value(value, triggerChange) {
        this.value = value;
        if (triggerChange) {
            this.__triggerChange();
        }
    }
});
