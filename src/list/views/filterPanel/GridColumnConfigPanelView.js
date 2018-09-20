import { columnType, queryBuilderActions } from '../../../Meta';
import ConfigPanelSortView from './ConfigPanelSortView';
import template from '../../templates/gridColumnConfigPanel.html';
import ConfigPanelGroupView from './ConfigPanelGroupView';
import ConfigPanelFilterView from './ConfigPanelFilterView';
import ConfigPanelAggregationView from './ConfigPanelAggregationView';

export default Marionette.View.extend({
    triggers: {
        'click @ui.addFilterButton': 'click:addFilterButton'
    },

    regions: {
        tabsRegion: '.js-dataset-options-container'
    },

    events: {
        'click @ui.applyButton': '__applyButtonClick'
    },

    ui: {
        addFilterButton: '.js-add-filter-button',
        applyButton: '.js-apply-button'
    },

    onRender() {
        this.showChildView('tabsRegion', this.__getTabsView());
    },

    template: Handlebars.compile(template),

    className: 'dev-dropdown-filter-panel',

    __getTabsView() {
        const tabs = new Core.layout.TabLayout({
            tabs: [
                {
                    name: '<i class="fal fa-sort-amount-down" aria-hidden="true"></i>',
                    id: 'sort',
                    view: new ConfigPanelSortView({ model: this.options.model })
                },
                {
                    name: '<i class="fal fa-filter" aria-hidden="true"></i>',
                    id: 'filter',
                    view: new ConfigPanelFilterView({
                        filtersConfigurationModel: this.options.model.get('filtersConfigurationModel'),
                        columnType: this.options.model.get('columnType'),
                        model: this.options.model
                    })
                },
                {
                    name: '<i class="fal fa-clone" aria-hidden="true"></i>',
                    id: 'group',
                    view: new ConfigPanelGroupView({
                        level: this.options.model.get('level'),
                        model: this.options.model
                    })
                },
                {
                    name: '<i class="fal fa-plus-square" aria-hidden="true"></i>',
                    id: 'Aggregation',
                    view: new ConfigPanelAggregationView({
                        columnType: this.options.model.get('columnType'),
                        model: this.options.model
                    })
                }
            ]
        });

        this.listenTo(tabs, 'changed:selectedTab', model => {
            this.__adjustAddFilterButtonVisibility();
            this.trigger('panel:tab:switch', model.id);
        });
        this.listenTo(tabs, 'tab:trigger:apply', () => this.__applyButtonClick());

        return tabs;
    },

    __applyButtonClick() {
        this.trigger('click:applyButton');
    },

    __adjustAddFilterButtonVisibility(isModelEmpty) {
        if (this.model.get('actionId') === queryBuilderActions.filter) {
            if (isModelEmpty) {
                this.ui.addFilterButton.show();
            } else {
                switch (this.model.get('columnType')) {
                    case columnType.id:
                    case columnType.string:
                    case columnType.integer:
                    case columnType.decimal:
                    case columnType.datetime:
                    case columnType.duration:
                        this.ui.addFilterButton.show();
                        break;
                    case columnType.boolean:
                        if (this.collection.length < 3) {
                            this.ui.addFilterButton.show();
                        } else {
                            this.ui.addFilterButton.hide();
                        }
                        break;
                    case columnType.enumerable:
                    case columnType.users:
                    case columnType.document:
                    case columnType.reference:
                        this.ui.addFilterButton.hide();
                        break;
                    default:
                        throw new Error(`Unknown column type ${this.actionId}`);
                }
            }
        } else {
            this.ui.addFilterButton.hide();
        }
    }
});
