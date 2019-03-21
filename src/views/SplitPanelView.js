//@flow
import template from './templates/splitPanel.hbs';
import SplitPanelResizer from './SplitPanelResizer';

const orientationClasses = {
    vertical: 'split-panel_vertical',
    horizontal: 'split-panel_horizontal'
};

export default Marionette.View.extend({
    initialize() {
        this.regionModulesMap = [];
        this.resisersList = [];
    },

    template: Handlebars.compile(template),

    className() {
        return `split-panel_container ${this.options.horizontal ? orientationClasses.horizontal : orientationClasses.vertical}`;
    },

    onRender() {
        const handlerRoutPairs = this.options.handlerRoutPairs;

        if (handlerRoutPairs && handlerRoutPairs.length) {
            this.__initializeViews(handlerRoutPairs);
        }
    },

    toggleOrientation(type) {
        if (type === 'no') {
            this.__hidePanels();
        } else {
            this.__showPanels();
            this.el.className = `split-panel_container ${type === 'horizontal' ? orientationClasses.horizontal : orientationClasses.vertical}`;
            this.resisersList.forEach(resizer => resizer.toggleOrientation(type));
        }
    },

    onAttach() {
        this.__initializeResizers();
    },

    onDestroy() {
        this.resisersList.forEach(resizer => resizer.destroy());
    },

    __initializeViews(handlerRoutPairs) {
        handlerRoutPairs.forEach((pair, i) => {
            const regionEl = document.createElement('div');
            regionEl.className = `js-tile${i + 1}-region split-panel_tile`;

            this.el.insertAdjacentElement('beforeEnd', regionEl);

            const region = this.addRegion(`js-tile${i + 1}-region`, {
                el: regionEl
            });
            this.regionModulesMap.push({
                pair,
                routeRegExp: pair.routeRegExp,
                region
            });
            pair.callback(pair.route);
        });
    },

    __initializeResizers() {
        for (let i = 0; i < this.regionModulesMap.length - 1; i++) {
            //after each, except last
            const resizer = new SplitPanelResizer({
                firstPanel: this.regionModulesMap[i].region,
                secondPanel: this.regionModulesMap[i + 1]?.region
            });
            this.resisersList.push(resizer);
            this.regionModulesMap[i].region.el.insertAdjacentElement('afterEnd', resizer.render().el);
        }
    },

    __hidePanels() {
        const regions = Object.values(this.regions);
        regions[0].el.style.flex = '';

        for (let i = 1; i < regions.length; i++) {
            this.resisersList[i - 1].$el.hide();
            regions[i].el.setAttribute('hidden', '');
        }
    },

    __showPanels() {
        const regions = Object.values(this.regions);
        regions[0].el.style.flex = '';

        for (let i = 1; i < regions.length; i++) {
            const resizer = this.resisersList[i - 1];

            resizer.$el.show();
            regions[i].el.removeAttribute('hidden');

            resizer.doManualResize();
        }
    }
});
