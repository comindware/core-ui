define([ 'comindware/core', 'demoPage/views/CanvasView' ], (core, CanvasView) => {
    'use strict';

    return function() {
        // Important layout note: SplitPanelView expect that region element has computed size != 0.

        const Panel1View = Marionette.ItemView.extend({
            template: Handlebars.compile('Panel 1'),
            className: 'demo-split-panel demo-split-panel_left'
        });

        const Panel2View = Marionette.ItemView.extend({
            template: Handlebars.compile('Panel 2'),
            className: 'demo-split-panel demo-split-panel_right'
        });

        const MySplitPanel = core.views.SplitPanelView.extend({
            options: {
                panel1Min: 100,
                panel2Min: 100
            },

            onShow() {
                this.panel1Region.show(new Panel1View());
                this.panel2Region.show(new Panel2View());
            }
        });

        return new CanvasView({
            view: new MySplitPanel(),
            canvas: {
                height: '250px'
            }
        });
    };
});
