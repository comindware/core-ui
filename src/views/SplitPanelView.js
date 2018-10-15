//@flow
import template from './templates/splitPanel.hbs';
import SplitPanelResizer from './SplitPanelResizer';

export default Marionette.View.extend({
    initialize() {
        this.regionModulesMap = [];
    },

    template: Handlebars.compile(template),

    className: 'split-panel_container',

    ui: {
        splitPanelWrapper: '.split-panel_wrapper'
    },

    events: {
        'mousedown @ui.resizer': '__handleResizerMousedown'
    },

    onRender() {
        const handlerRoutPairs = this.options.handlerRoutPairs;

        if (handlerRoutPairs && handlerRoutPairs.length) {
            this.__initializeViews(handlerRoutPairs);
        }
    },

    onAttach() {
        this.__initializeResizers();
    },

    __initializeViews(handlerRoutPairs) {
        handlerRoutPairs.forEach((pair, i) => {
            const regionEl = document.createElement('div');
            regionEl.className = `js-tile${i + 1}-region split-panel_tile`;

            this.ui.splitPanelWrapper.append(regionEl);

            const region = this.addRegion(`js-tile${i + 1}-region`, {
                el: regionEl
            });
            this.regionModulesMap.push({
                pair,
                routeRegExp: pair.routeRegExp,
                region
            });
            setTimeout(() => pair.callback(pair.route));
        });
    },

    __initializeResizers() {
        this.regionModulesMap.forEach((pair, i) => {
            pair.region.el.insertAdjacentElement(
                'afterEnd',
                new SplitPanelResizer({
                    firstPanel: pair.region,
                    secondPanel: this.regionModulesMap[i + 1]?.region
                }).render().el
            );
        });
    }
});
