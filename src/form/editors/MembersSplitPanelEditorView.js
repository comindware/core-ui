
import template from './templates/membersSplitPanelEditor.html';
import MembersSplitPanelController from './impl/membersSplit/controller/MembersSplitPanelController';
import cacheService from '../../services/CacheService';
import formRepository from '../formRepository';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';

const defaultOptions = () => ({
    exclude: [],
    displayText: '',
    hideUsers: false,
    hideGroups: false,
    maxQuantitySelected: null,
    allowRemove: true,
    title: '',
    itemsToSelectText: Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.USERSTOSELECT'),
    selectedItemsText: Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.SELECTEDUSERS'),
    searchPlaceholder: Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.SEARCHUSERS'),
    emptyListText: Localizer.get('SUITEGENERAL.FORM.EDITORS.MEMBERSPLIT.EMPTYLIST')
});

formRepository.editors.MembersSplitPanel = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        const defOps = _.extend(defaultOptions(), {
            users: _.map(cacheService.GetUsers(), user => ({
                id: user.Id,
                name: (user.Text || user.Username),
                abbreviation: user.abbreviation,
                userpicUri: user.userpicUri,
                type: 'users'
            })),
            groups: _.map(cacheService.GetGroups(), group => ({
                id: group.id,
                name: group.name,
                type: 'groups'
            }))
        });
        if (options.schema) {
            _.extend(this.options, defOps, _.pick(options.schema, _.keys(defOps)));
        } else {
            _.extend(this.options, defOps, _.pick(options || {}, _.keys(defOps)));
        }
        this.options.selected = this.getValue();

        this.controller = new MembersSplitPanelController(this.options);
        this.controller.on('popup:ok', () => {
            this.__value(this.options.selected, true);
        });
    },

    className: 'member-split-panel-editor__view',

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

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            displayText: this.options.displayText
        };
    },

    setValue(value) {
        this.__value(value, false);
    },

    onShow() {
        this.controller.initItems();
        this.splitPanelRegion.show(this.controller.view);
    },

    __value(value, triggerChange) {
        this.value = value;
        if (triggerChange) {
            this.__triggerChange();
        }
    }
});

export default formRepository.editors.MembersSplitPanel;
