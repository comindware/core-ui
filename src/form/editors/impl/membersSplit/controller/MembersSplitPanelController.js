import BaseSplitController from '../../splitEditor/controller/BaseSplitController';
import MembersSplitPanelView from '../views/MembersSplitPanelView';
import LocalizationService from '../../../../../services/LocalizationService';
import helpers from '../../../../../utils/helpers';

export default BaseSplitController.extend({
    initialize(options) {
        this.options = options;
        BaseSplitController.prototype.initialize.apply(this, arguments);
        this.__fillDisplayText();

        this.channel = new Backbone.Radio.channel(_.uniqueId('membersSplitPanel'));
        this.channel.on('items:select', this.selectItemsByToolbar, this);
        this.channel.on('items:search', this.selectItemsByFilter, this);
        this.channel.on('items:move', this.__onItemsMove, this);
    },

    __fillInModel() {
        const users = this.options.users;
        const groups = this.options.groups;
        const members = {};

        users.forEach(model => (members[model.id] = model));

        groups.forEach(model => (members[model.id] = model));

        this.model.set({
            title: this.__getFullMemberSplitTitle(),
            items: members,
            showUsers: !this.options.hideUsers,
            showGroups: !this.options.hideGroups,
            showAll: !this.options.hideUsers && !this.options.hideGroups,
            itemsToSelectText: this.options.itemsToSelectText,
            selectedItemsText: this.options.selectedItemsText,
            confirmEdit: true,
            showToolbar: true,
            searchPlaceholder: this.options.searchPlaceholder,
            emptyListText: this.options.emptyListText
        });
    },

    __fillDisplayText() {
        const members = this.model.get('items');
        const membersCount = {
            users: 0,
            groups: 0
        };

        const selected = this.options.selected;

        selected
            && selected.forEach(id => {
                if (members[id]) {
                    membersCount[members[id].type]++;
                }
            });
        this.options.displayText = this.options.hideUsers
            ? ''
            : helpers.getPluralForm(membersCount.users, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.USERS')).replace('{0}', membersCount.users);
        this.options.displayText += this.options.displayText.length > 0 ? ' ' : '';
        this.options.displayText += this.options.hideGroups
            ? ''
            : helpers.getPluralForm(membersCount.groups, LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.GROUPS')).replace('{0}', membersCount.groups);
    },

    __getFullMemberSplitTitle() {
        if (this.options.title) {
            switch (this.options.title) {
                case 'Members':
                    return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.MEMBERSTITLE');
                case 'Performers':
                    return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.PERFORMERSTITLE');
                default:
                    return this.options.title;
            }
        }
        return LocalizationService.get('CORE.FORM.EDITORS.MEMBERSPLIT.TITLE');
    },

    createView() {
        this.view = new MembersSplitPanelView({
            channel: this.channel,
            model: this.model
        });
    },

    __onItemsMove(typeFrom, typeTo, all) {
        this.moveItems(typeFrom, typeTo, all);
        setTimeout(() => this.updateMembers(), 100);
    }
});
