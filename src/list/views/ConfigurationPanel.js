import template from '../../templates/gridColumnConfigTabPanel.html';

const constants = {
    animationTime: 100,
    contentRegion: '.js-content-region'
};

export default Marionette.View.extend({
    initialize(options) {
        this.panelViewModel = new Backbone.Model({
            columnModel: new Backbone.Model()
        });

        this.panelViewModel.set({
            columnType: this.columnModel.get('columnType'),
            filtersConfigurationModel: new Backbone.Model({
                datasourceId: this.datasourceId,
                columnType: this.columnModel.get('columnType'),
                dataFormat: this.columnModel.get('dataFormat'),
                query: this.columnModel.get('queryConfiguration')
            }),
            level,
            columnModel: viewData,
            isActionChange: isNeedToApply
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
        this.showChildView('tabPanelRegion', this.panelView);
        this.listenTo(Core.services.GlobalEventService, 'window:mousedown:captured', this.__handleGlobalMousedown);
    },

    __handleGlobalMousedown(target) {
        if (!this.__isNestedInPanel(target) && !this.__isNestedInButton(target)) {
            this.trigger('mouseDown', true);
        }
    },

    __isNestedInButton(testedEl) {
        return this.el === testedEl || $.contains(this.el, testedEl) || $.contains(this.panelView.el, testedEl);
    },

    __isNestedInPanel(testedEl) {
        return !!$(testedEl).parents('.js-core-ui__global-popup-region').length || !!$(testedEl).parents('.js-grid-header-region').length;
    },

    updatePanelView(options) {
        this.panelView.updateView && this.panelView.updateView(options);
    },

    __createPanelView(panelView, options) {
        return new panelView(options);
    },

    __handleMouseLeave(event) {
        if ($(event.toElement).parents(constants.contentRegion).length > 0) {
            this.trigger('mouseleave');
        }
    }
});
