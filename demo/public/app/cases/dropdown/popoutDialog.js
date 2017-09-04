define([
    'comindware/core', 'demoPage/views/CanvasView', 'demoPage/views/DemoProfilePanelView'
], (core, CanvasView, DemoProfilePanelView) => {
    'use strict';

    return function() {
        const DemoButtonView = Marionette.ItemView.extend({
            template() {
                return Handlebars.compile('Demo Button');
            },
            tagName: 'span'
        });

        const popout = core.dropdown.factory.createDialogPopout({
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
