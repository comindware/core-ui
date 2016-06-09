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

        var popout = core.dropdown.factory.createDialogPopout({
            buttonView: DemoButtonView,
            panelView: DemoProfilePanelView,
            popoutFlow: 'right'
        });

        return new CanvasView({
            view: popout,
            canvas: {
                height: '30px'
            },
            region: {
                float: 'left'
            }
        });
    };
});
