import { objectPropertyTypes, iconsNames } from 'Meta';
import MembersListItemView from './MembersListItemView';
import template from '../templates/baseMembersGrid.hbs';

const toolbarActions = {
    MOVE_ALL: 'Move-all'
};

export default Marionette.View.extend({
    initialize(options) {
        this.title = options.title;
        this.filterFnParameters = options.filterFnParameters;

        const toolbarFlags = {
            showGroups: options.model.get('showGroups'),
            showUsers: options.model.get('showUsers'),
            filterFnParameters: this.filterFnParameters,
            hideToolbar: options.hideToolbar
        };

        this.gridView = this.__getGridView({
            collection: this.collection,
            toolbarFlags,
            handleSearch: this.handleSearch,
            config: options.config
        });

        this.quantityWarningView = new Core.layout.PlainText({
            text: Localizer.get('CORE.FORM.EDITORS.REFERENCE.QUANTITYWARNING'),
            class: 'member-split-quantity-warning'
        });
    },

    template: Handlebars.compile(template),

    templateContext() {
        return { title: this.title };
    },

    regions: {
        gridRegion: {
            el: '.js-grid-region',
            replaceElement: true
        }
    },

    onRender() {
        this.showChildView('gridRegion', this.gridView);
        this.listenTo(this, 'set:loading', state => this.__setLoading(state));
        this.listenTo(this.gridView, 'search', text => {
            this.collection.highlight(text);
        });
    },

    __getGridView(options) {
        const { collection, toolbarFlags, handleSearch, config } = options;
        this.controller = new Core.list.controllers.GridController({
            collection,
            selectableBehavior: 'multi',
            showSearch: true,
            handleSearch,
            showToolbar: !toolbarFlags.hideToolbar,
            showCheckbox: false,
            showHeader: false,
            additionalActions: this.__getToolbarItems(toolbarFlags),
            excludeActions: 'all',
            columns: [
                {
                    title: 'name',
                    type: objectPropertyTypes.STRING,
                    key: 'name'
                }
            ],
            listViewOptions: {
                height: 'auto',
                childView: MembersListItemView,
                childHeight: config?.CHILD_HEIGHT,
                emptyViewOptions: {
                    text: this.model.get('emptyListText')
                },
                // maxRows: 10
                childViewSelector: this.options.childViewSelector
            }
        });

        const gridView = this.controller.view;

        return gridView;
    },

    __getToolbarItems(toolbarFlags) {
        const { showGroups, showUsers, filterFnParameters } = toolbarFlags;
        const result = [];
        if (showGroups && showUsers) {
            result.push({
                id: filterFnParameters.users,
                type: 'Checkbox',
                class: 'filter-users-btn',
                isChecked: true,
                iconClass: iconsNames.user,
                description: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.PEOPLE')
            });
            result.push({
                id: filterFnParameters.groups,
                type: 'Checkbox',
                class: 'filter-groups-btn',
                isChecked: true,
                iconClass: iconsNames.users,
                description: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.GROUP')
            });
        }
        result.push({
            id: toolbarActions.MOVE_ALL,
            iconClass: 'check-double',
            class: 'move-all-btn',
            type: 'Button',
            description: Localizer.get('CORE.FORM.EDITORS.MEMBERSPLIT.SELECTALL')
        });

        return result;
    },

    setLoading(state) {
        const controller = this.controller;
        controller && !controller.isDestroyed() && controller.setLoading(state);
    }
});
