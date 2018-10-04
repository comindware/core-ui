

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    // Important layout note: SplitPanelView expect that region element has computed size != 0.

    const Panel1View = Marionette.View.extend({
        template: Handlebars.compile('Panel 1'),
        className: 'demo-split-panel demo-split-panel_left'
    });

    const Panel2View = Marionette.View.extend({
        template: Handlebars.compile('Panel 2'),
        className: 'demo-split-panel demo-split-panel_right'
    });

    const MySplitPanel = Core.views.SplitPanelView.extend({
        options: {
            panel1Min: 100,
            panel2Min: 100
        },

        onRender() {
            this.showChildView('panel1Region', new Panel1View());
            this.showChildView('panel2Region', new Panel2View());
        }
    });

    return new CanvasView({
        view: new MySplitPanel(),

        canvas: {
            height: '250px',
            width: '400px'
        }
    });
}
