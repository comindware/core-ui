//@flow
import template from './templates/splitPanel.hbs';
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
        this.el.className = this.className();
        this.__showPanels();
    },

    __initializeViews(handlerRoutPairs) {
        handlerRoutPairs.forEach((pair, i) => {
            const regionEl = document.createElement('div');
            regionEl.className = `js-tile${i + 1}-region split-panel__tile${i === 0 ? ' general' : ''}`;
            this.on('scroll:view', () => {
                if (i !== 0) {
                    regionEl.scrollIntoView({ behavior: 'smooth' });
                }
            });

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

    __hidePanels() {
        const regions = Object.values(this.regions);
        regions[0].el.style.flex = '';

        for (let i = 1; i < regions.length; i++) {
            regions[i].el.setAttribute('hidden', '');
        }
    },

    __showPanels() {
        const regions = Object.values(this.regions);
        regions[0].el.style.flex = '';

        for (let i = 1; i < regions.length; i++) {
            regions[i].el.removeAttribute('hidden');
        }
    }
});
