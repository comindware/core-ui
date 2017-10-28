
import template from './templates/membersSplitEditor.hbs';
import MemberSplitController from './impl/membersSplit/controller/MemberSplitController';
import formRepository from '../formRepository';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import WindowService from '../../services/WindowService';
import LocalizationService from '../../services/LocalizationService';

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

formRepository.editors.MembersSplit = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        const defOps = _.extend(defaultOptions(), {
            users: _.map(options.schema.cacheService.GetUsers(), user => ({
                id: user.Id,
                name: (user.Text || user.Username),
                abbreviation: user.abbreviation,
                userpicUri: user.userpicUri,
                type: 'users'
            })),
            groups: _.map(options.schema.cacheService.GetGroups(), group => ({
                id: group.id,
                name: group.name,
                type: 'groups'
            }))
        });
        if (options.schema) {
            Object.assign(this.options, defOps, _.pick(options.schema, _.keys(defOps)));
        } else {
            Object.assign(this.options, defOps, _.pick(options || {}, _.keys(defOps)));
        }

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

    templateHelpers() {
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

export default formRepository.editors.MembersSplit;
