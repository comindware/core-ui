//@flow
import template from '../../templates/clonePopoutPanel.html';

export default Marionette.View.extend({
    initialize() {
        this.columns = this.__createColumnsList();
        this.gridView = this.__createGrid();
        this.listenTo(this.grid, 'execute', actionModel => this.trigger('click:clearEventsButton', actionModel));
        this.listenTo(this.grid, 'click', rowModel => this.trigger('click:row', rowModel));
    },

    template: Handlebars.compile(template),

    className: 'error-container',

    regions: {
        eventCenterGridRegion: '.js-event-center-grid-region'
    },

    ui: {
        eventCenterButtonClose: '.js-event-center-button-close'
    },

    triggers: {
        'click @ui.eventCenterButtonClose': 'click:closeButton'
    },

    onRender() {
        this.getRegion('eventCenterGridRegion').show(this.gridView);
    },

    __createColumnsList() {
        return [
            {
                id: 'id',
                displayText: Localizer.get('PROCESS.FORMDESIGNER.TOOLBAR.ID'),
                type: 'string',
                width: 0.2
            },
            {
                id: 'name',
                displayText: Localizer.get('PROCESS.FORMDESIGNER.TOOLBAR.NAME'),
                type: 'string',
                width: 0.8
            }
        ];
    },

    __createGrid() {
        const excludeActions = 'all';

        this.grid = new Core.list.controllers.GridController({
            columns: this.columns,
            excludeActions,
            collection: this.options.collection,
            showFilter: true
        });

        return this.grid.view;
    }
});
