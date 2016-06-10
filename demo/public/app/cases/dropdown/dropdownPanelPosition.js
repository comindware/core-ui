define([
    'comindware/core',
    'demoPage/views/CanvasView',
    'demoPage/views/DemoDropdownPanelView',
    'demoPage/views/DemoInputView',
    'demoPage/dataProvider'
], function (core, CanvasView, DemoDropdownPanelView, DemoInputView, dataProvider) {
    'use strict';
    return function () {
        var collection = new Backbone.Collection(core.services.UserService.listUsers(), {
            comparator: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'name')
        });

        /*
          Possible panelPosition values:
             'down',
             'down-over',
             'up',
             'up-over'
        */

        var dropdown = core.dropdown.factory.createDropdown({
            buttonView: DemoInputView,
            panelView: DemoDropdownPanelView,
            panelViewOptions: {
                collection: collection
            },
            panelPosition: 'down-over'
        });

        return new CanvasView({
            view: dropdown,
            canvas: {
                width: '300px'
            }
        });
    };
});
