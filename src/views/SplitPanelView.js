//@flow
import template from './templates/splitPanel.hbs';
import SplitPanelResizer from './SplitPanelResizer';
import { splitViewTypes } from '../Meta';

const orientationClasses = {
    [splitViewTypes.UNDEFINED]: 'split-panel__general',
    [splitViewTypes.GENERAL]: 'split-panel__general',
    [splitViewTypes.VERTICAL]: 'split-panel__vertical',
    [splitViewTypes.HORIZONTAL]: 'split-panel__horizontal'
};

const defaultOptions = {
    viewType: splitViewTypes.VERTICAL
};

export default Marionette.View.extend({
    initialize() {
        this.regionModulesMap = [];
        this.resisersList = [];
    },

    template: Handlebars.compile(template),

    className() {
        _.defaults(this.options, defaultOptions);
        return `split-panel_container ${orientationClasses[this.options.viewType]}`;
    },

    onRender() {
        const handlerRoutPairs = this.options.handlerRoutPairs;

        if (handlerRoutPairs && handlerRoutPairs.length) {
            this.__initializeViews(handlerRoutPairs);
        }
    },

    toggleOrientation(viewType = defaultOptions.viewType, position) {
        this.options.viewType = viewType;
        this.resisersList.forEach(resizer => resizer.toggleOrientation(this.options.viewType, position));
        this.el.className = this.className();
        this.__showPanels();
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
            regionEl.className = `js-tile${i + 1}-region split-panel__tile${i === 0 ? ' general' : ''}`;

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
                orientation: this.options.viewType,
                firstPanel: this.regionModulesMap[i].region,
                secondPanel: this.regionModulesMap[i + 1] ?.region,
                splitViewPosition: this.options.splitViewPosition
            });
            this.listenTo(resizer, 'change:resizer', (splitPosition, viewType) => {
                this.trigger('change:resizer', splitPosition, viewType);
            });
            this.resisersList.push(resizer);
            this.regionModulesMap[i].region.el.insertAdjacentElement('afterEnd', resizer.render().el);
        }
    },

    __hidePanels() {
        const regions = Object.values(this.regions);
        regions[0].el.style.flex = '';

        for (let i = 1; i < regions.length; i++) {
            this.resisersList[i - 1].el.setAttribute('hidden', true);
            regions[i].el.setAttribute('hidden', '');
        }
    },

    __showPanels() {
        const regions = Object.values(this.regions);
        regions[0].el.style.flex = '';

        for (let i = 1; i < regions.length; i++) {
            const resizer = this.resisersList[i - 1];

            resizer.el.removeAttribute('hidden');
            regions[i].el.removeAttribute('hidden');

            resizer.render();
        }
    }
});
