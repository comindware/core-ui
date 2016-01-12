define([
    'comindware/core',
    'demoPage/views/CanvasView',
    'demoPage/views/DemoDropdownPanelView',
    'demoPage/views/DemoInputView',
    'demoPage/demoDataProvider'
], function (core, CanvasView, DemoDropdownPanelView, DemoInputView, demoDataProvider) {
    'use strict';
    return function () {
        var collection = demoDataProvider.createIdFullNameCollection();

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
