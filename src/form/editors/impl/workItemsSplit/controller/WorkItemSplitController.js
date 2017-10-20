

import BaseSplitController from '../../splitEditor/controller/BaseSplitController';
import WorkSpaceSplitView from '../view/WorkSpaceSplitView';

const GroupingModel = Backbone.Model.extend({
    initialize() {
        _.extend(this, new Core.list.models.behaviors.ListGroupBehavior(this));
    }
});

const itemClassHash = {
    'cmw.workspace.SettingsItem': 'icons-from-nav_settings',
    'cmw.workspace.ActivityItem': 'icons-from-nav_activity',
    'cmw.workspace.ProjectsItem': 'icons-from-nav_projects',
    'cmw.workspace.TemplateItem': 'icons-from-nav_processtemplate',
    'cmw.workspace.RoomsItem': 'icons-from-nav_room',
    'cmw.workspace.DocumentsItem': 'icons-from-nav_documents',
    'cmw.workspace.PeopleItem': 'icons-from-nav_people',
    'cmw.workspace.ProcessMonitoringItem': 'icons-from-nav_processmonitor',
    'cmw.workspace.ArchitectureItem': 'icons-from-nav_architecture',
    'cmw.workspace.TimesheetsItem': 'icons-from-nav_timesheets',
    'cmw.workspace.GlobalFunctionsItem': 'icons-from-nav_global',
    'cmw.workspace.DataDiagramItem': 'icons-from-nav_datadiagram',
    'cmw.workspace.ReportsItem': 'icons-from-nav_reports',
    'cmw.workspace.CommunicationChannelsItem': 'icons-from-nav_channel',
    'cmw.workspace.CommunicationRoutesItem': 'icons-from-nav_routes'
};

export default BaseSplitController.extend({
    initialize() {
        this.groupConfig = [
            {
                iterator(model) {
                    return model.get('systemType') === 'cmw.workspace.SystemItem';
                },
                modelFactory(model) {
                    const displayValue = model.get('systemType') === 'cmw.workspace.SystemItem'
                        ? Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.SYSTEMSECTIONS')
                        : Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.RECORDTYPES');
                    return new GroupingModel({
                        displayText: displayValue
                    });
                }
            }
        ];
        BaseSplitController.prototype.initialize.apply(this, arguments);
        this.channel.on('item:up', this.__itemUp.bind(this));
        this.channel.on('item:down', this.__itemDown.bind(this));
    },

    __itemUp(model) {
        const selectedItems = this.model.get('selected').models;
        const selectedItemIds = _.map(selectedItems, item => item.id);
        const currModelIndex = selectedItemIds.indexOf(model.id);
        if (currModelIndex > 0) {
            const prevOrder = selectedItems[currModelIndex - 1].get('order');
            const prevPrevOrder = currModelIndex > 1 ? selectedItems[currModelIndex - 2].get('order') : 0;
            model.set('order', (prevOrder + prevPrevOrder) / 2);
        }
        this.model.get('selected').sort();
    },

    __itemDown(model) {
        const selectedItems = this.model.get('selected').models;
        const selectedItemIds = _.map(selectedItems, item => item.id);
        const currModelIndex = selectedItemIds.indexOf(model.id);
        if (currModelIndex < selectedItems.length - 1) {
            const nextOrder = selectedItems[currModelIndex + 1].get('order');
            const nextNextOrder = (currModelIndex < selectedItems.length - 2) ? selectedItems[currModelIndex + 2].get('order') : nextOrder + 2;
            model.set('order', (nextOrder + nextNextOrder) / 2);
        }
        this.model.get('selected').sort();
    },

    __fillInModel() {
        const workItems = Promise.resolve(this.options.schema.allWorkItems).then(allWorkItems => _.reduce(allWorkItems, (hash, item) => {
            item.className = item.systemType === 'cmw.object.App'
                ? 'icons-from-nav_recordtype'
                : itemClassHash[item.id];
            hash[item.id] = item;
            return hash;
        }, {}));

        this.model.set({
            title: Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.TITLE'),
            items: workItems,
            itemsToSelectText: Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.AVAILABLESECTIONS'),
            selectedItemsText: Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.USERSSECTIONS'),
            confirmEdit: true,
            showToolbar: false,
            maxQuantitySelected: false,
            rejectText: Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.CANCEL'),
            acceptText: Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.UPDATE'),
            searchPlaceholder: Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.SEARCHBYSECTION'),
            emptyListText: Localizer.get('SUITEGENERAL.FORM.EDITORS.WORKSPACEITEMSPLIT.EMPTYLIST')
        });
    },

    createView() {
        this.view = new WorkSpaceSplitView({
            channel: this.channel,
            model: this.model
        });
    }
});
