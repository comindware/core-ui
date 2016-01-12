define([ 'comindware/core', 'demoPage/views/CanvasView' ], function (core, CanvasView) {
    'use strict';

    return function () {
        // Important layout note: SplitPanelView expect that region element has computed size != 0.

        var Panel1View = Marionette.ItemView.extend({
            template: Handlebars.compile('<div>Panel 1</div>'),
            className: 'demo-cases__other__split-panel__panel'
        });

        var Panel2View = Marionette.ItemView.extend({
            template: Handlebars.compile('<div>Panel 2</div>'),
            className: 'demo-cases__other__split-panel__panel'
        });

        var MySplitPanel = core.views.SplitPanelView.extend({
            options: {
                panel1Min: 100,
                panel2Min: 100
            },

            onShow: function () {
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
