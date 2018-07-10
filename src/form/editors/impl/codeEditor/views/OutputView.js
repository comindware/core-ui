import template from '../templates/output.html';

export default Marionette.View.extend({
    initialize(options) {
        this.model = options.model;
        this.editor = options.editor;
        this.listenTo(this.editor, 'compile', compileOutput => {
            this.model.get('errors').reset(compileOutput.errors);
            this.model.get('warnings').reset(compileOutput.warnings);
        });
    },

    template: Handlebars.compile(template),

    className: 'dev-code-editor-output',

    regions: {
        tabsRegion: '.output-tabs-region'
    },

    onRender() {
        this.errorsGridController = new Core.list.controllers.GridController({
            columns: this.__getErrorsColumns(),
            excludeActions: 'all',
            collection: this.model.get('errors')
        });
        this.errorsGrid = this.errorsGridController.view;

        this.warningsGridController = new Core.list.controllers.GridController({
            columns: this.__getWarningsColumns(),
            excludeActions: 'all',
            collection: this.model.get('warnings')
        });
        this.warningsGrid = this.warningsGridController.view;

        this.listenTo(this.errorsGridController, 'dblclick', model => {
            const cursorPos = {
                ch: model.get('column') - 1,
                line: model.get('line') - 1
            };
            const type = 'error';
            this.trigger('changeCursorPos', cursorPos, type);
        });
        this.listenTo(this.warningsGridController, 'dblclick', model => {
            const cursorPos = {
                ch: model.get('column') - 1,
                line: model.get('line') - 1
            };
            const type = 'warning';
            this.trigger('changeCursorPos', cursorPos, type);
        });

        this.tabsPanelsView = new Core.layout.TabLayout({
            tabs: this.__getTabs()
        });

        this.showChildView('tabsRegion', this.tabsPanelsView);
    },

    __getErrorsColumns() {
        return [
            {
                title: 'Line',
                key: 'line',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.15
            },
            {
                title: 'Column',
                key: 'column',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.15
            },
            {
                title: 'Messcode',
                key: 'messcode',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.2
            },
            {
                title: 'Message',
                key: 'message',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.5
            }
        ];
    },

    __getWarningsColumns() {
        return [
            {
                title: 'Line',
                key: 'line',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.1
            },
            {
                title: 'Column',
                key: 'column',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.1
            },
            {
                title: 'Messcode',
                key: 'messcode',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.2
            },
            {
                title: 'Message',
                key: 'message',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.4
            },
            {
                title: 'Warning level',
                key: 'warningLevel',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.1
            }
        ];
    },

    __getTabs() {
        return [
            {
                id: 'tab1',
                name: 'Errors',
                view: this.errorsGrid
            },
            {
                id: 'tab2',
                name: 'Warnings',
                view: this.warningsGrid
            },
            {
                id: 'tab3',
                name: 'Info',
                view: new Core.list.factory.createDefaultGrid({
                    gridViewOptions: {
                        columns: [
                            {
                                title: 'Line',
                                key: 'line',
                                type: Core.meta.objectPropertyTypes.INTEGER,
                                autocommit: true,
                                width: 0.15
                            },
                            {
                                title: 'Column',
                                key: 'column',
                                type: Core.meta.objectPropertyTypes.INTEGER,
                                autocommit: true,
                                width: 0.15
                            },
                            {
                                title: 'Messcode',
                                key: 'messcode',
                                type: Core.meta.objectPropertyTypes.STRING,
                                autocommit: true,
                                width: 0.2
                            },
                            {
                                title: 'Message',
                                key: 'message',
                                type: Core.meta.objectPropertyTypes.STRING,
                                autocommit: true,
                                width: 0.5
                            }
                        ],
                        selectableBehavior: 'multi'
                    },
                    key: 'errors',
                    collection: this.model.get('errors'),
                    autocommit: true,
                    height: 'auto',
                    maxRows: 5
                })
            }
        ];
    }
});
