import template from '../templates/output.html';
import LocalizationService from '../../../../../services/LocalizationService';

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
        const errorsGridController = new Core.list.controllers.GridController({
            columns: this.__getErrorsColumns(),
            excludeActions: 'all',
            collection: this.model.get('errors')
        });
        const errorsGrid = errorsGridController.view;

        const warningsGridController = new Core.list.controllers.GridController({
            columns: this.__getWarningsColumns(),
            excludeActions: 'all',
            collection: this.model.get('warnings')
        });
        const warningsGrid = warningsGridController.view;

        this.listenTo(errorsGridController, 'dblclick', model => {
            const cursorPos = {
                ch: model.get('column') - 1,
                line: model.get('line') - 1
            };
            const type = 'error';
            this.trigger('changeCursorPos', cursorPos, type);
        });
        this.listenTo(warningsGridController, 'dblclick', model => {
            const cursorPos = {
                ch: model.get('column') - 1,
                line: model.get('line') - 1
            };
            const type = 'warning';
            this.trigger('changeCursorPos', cursorPos, type);
        });

        const tabsPanelsView = new Core.layout.TabLayout({
            tabs: this.__getTabs(errorsGrid, warningsGrid)
        });

        this.showChildView('tabsRegion', tabsPanelsView);
    },

    __getErrorsColumns() {
        return [
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.ERRORS.LINE'),
                key: 'line',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.15
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.ERRORS.COLUMN'),
                key: 'column',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.15
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.ERRORS.MESSCODE'),
                key: 'messcode',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.2
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.ERRORS.MESSAGE'),
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
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.WARNINGS.LINE'),
                key: 'line',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.1
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.WARNINGS.COLUMN'),
                key: 'column',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.1
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.WARNINGS.MESSCODE'),
                key: 'messcode',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.2
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.WARNINGS.MESSAGE'),
                key: 'message',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.4
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.WARNINGS.WARNINGLEVEL'),
                key: 'warningLevel',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.1
            }
        ];
    },

    __getTabs(errorsGrid, warningsGrid) {
        return [
            {
                id: 'tab1',
                name: 'Errors',
                view: errorsGrid
            },
            {
                id: 'tab2',
                name: 'Warnings',
                view: warningsGrid
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
