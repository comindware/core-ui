import ConfigPanelSortView from './ConfigPanelSortView';
import ConfigPanelGroupView from './ConfigPanelGroupView';
import ConfigPanelFilterView from './ConfigPanelFilterView';
import ConfigPanelAggregationView from './ConfigPanelAggregationView';

export default function(options = {}) {
    const TabView = Core.layout.TabLayout.extend({
        triggers: {
            mouseleave: 'mouseleave',
            mouseenter: 'mouseenter'
        }
    });
    return new TabView({
        bodyClass: 'dataset-configuration-panel',
        tabs: [
            {
                name: '<i class="fal fa-sort-amount-down" aria-hidden="true"></i>',
                description: Localizer.get('PROCESS.DATASET.FILTERTOOLTIPS.SORTING'),
                id: 'sort',
                view: new ConfigPanelSortView({ model: options.model })
            },
            {
                name: '<i class="fal fa-filter" aria-hidden="true"></i>',
                description: Localizer.get('PROCESS.DATASET.FILTERTOOLTIPS.FILTRATION'),
                id: 'filter',
                view: new ConfigPanelFilterView({
                    filtersConfigurationModel: options.model.get('filtersConfigurationModel'),
                    columnType: options.model.get('columnType'),
                    model: options.model
                })
            },
            {
                name: '<i class="fal fa-clone" aria-hidden="true"></i>',
                description: Localizer.get('PROCESS.DATASET.FILTERTOOLTIPS.GROUPING'),
                id: 'group',
                view: new ConfigPanelGroupView({
                    level: options.model.get('level'),
                    model: options.model
                })
            },
            {
                name: '<i class="fal fa-plus-square" aria-hidden="true"></i>',
                description: Localizer.get('PROCESS.DATASET.FILTERTOOLTIPS.AGGREGATION'),
                id: 'Aggregation',
                view: new ConfigPanelAggregationView({
                    columnType: options.model.get('columnType'),
                    model: options.model
                })
            }
        ]
    });
}
