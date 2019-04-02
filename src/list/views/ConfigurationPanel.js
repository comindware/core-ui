import template from '../templates/gridColumnConfigTabPanel.html';
import PanelView from './сonfigurationPanel/GridColumnConfigPanelView';

const constants = {
    animationTime: 100,
    contentRegion: '.js-content-region'
};

export default Marionette.View.extend({
    initialize(options) {
        this.panelViewModel = new Backbone.Model({
            columnModel: new Backbone.Model()
        });

        this.isOpen = false;
        this.panelView = this.__createPanelView(options.panelView, options.panelViewOptions);
    },

    template: Handlebars.compile(template),

    className: 'columns-filters js-columns-filters dev-columns-filters',

    events: {
        mouseleave: '__handleMouseLeave'
    },

    triggers: {
        mouseenter: 'mouseenter'
    },

    regions: {
        tabPanelRegion: '.js-tab-panel-region'
    },

    onRender() {
        const panelView = new PanelView();
        this.showChildView('tabPanelRegion', panelView);

        this.listenTo(Core.services.GlobalEventService, 'window:mousedown:captured', target => this.__handleGlobalMousedown(target, panelView));
    },

    updatePanelConfiguration(level, viewData) {
        this.panelViewModel.set({
            columnType: this.columnModel.get('columnType'),
            filtersConfigurationModel: new Backbone.Model({
                datasourceId: this.datasourceId,
                columnType: this.columnModel.get('columnType'),
                dataFormat: this.columnModel.get('dataFormat'),
                query: this.columnModel.get('queryConfiguration')
            }),
            level,
            columnModel: viewData
        });
    },

    __handleGlobalMousedown(target, panelView) {
        if (!this.__isNestedInPanel(target) && !this.__isNestedInButton(target, panelView)) {
            this.trigger('mouseDown', true);
        }
    },

    __isNestedInButton(target, panelView) {
        return this.el === target || this.el.contains(target) || panelView.el.contains(target);
    },

    __isNestedInPanel(testedEl) {
        return testedEl.closest('.js-core-ui__global-popup-region') || testedEl.closest('.js-grid-header-region');
    },

    __createPanelView(panelView, options) {
        return new panelView(options);
    },

    __handleMouseLeave(event) {
        if (event.toElement.closest(constants.contentRegion)) {
            this.trigger('mouseleave');
        }
    }
});
