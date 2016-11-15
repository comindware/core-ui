define([
    'comindware/core', 'demoPage/views/CanvasView', 'demoPage/views/DemoProfilePanelView'
], function (core, CanvasView, DemoProfilePanelView) {
    'use strict';
    return function () {
        var DemoButtonView = Marionette.ItemView.extend({
            template: function () {
                return Handlebars.compile('Demo Button');
            },
            tagName: 'span'
        });

        var popout = core.dropdown.factory.createPopout({
            buttonView: DemoButtonView,
            panelView: DemoProfilePanelView,
            popoutFlow: 'right'
        });

        return new CanvasView({
            view: popout,
            canvas: {
                height: '800px',
                display: 'flex',
                'flex-flow': 'column',
                'justify-content': 'flex-end'
            },
            region: {
                height: 'auto'
            }
        });
    };
});
