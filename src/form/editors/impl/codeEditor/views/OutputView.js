import template from '../templates/output.html';
import LocalizationService from '../../../../../services/LocalizationService';

export default Marionette.View.extend({
    initialize(options) {
        this.model = options.model;
        this.editor = options.editor;
        this.listenTo(this.editor, 'compile', compileOutput => {
            this.model.get('errors').reset(compileOutput.errors);
            this.model.get('warnings').reset(compileOutput.warnings);
            this.model.get('info').reset(compileOutput.info);
        });
    },

    template: Handlebars.compile(template),

    className: 'dev-code-editor-output',

    regions: {
        tabsRegion: '.output-tabs-region'
    },

    onRender() {
        const errorsGridController = new Core.list.GridView({
            columns: this.__getErrorsColumns(),
            excludeActions: 'all',
            collection: this.model.get('errors')
        });
        const errorsGrid = errorsGridController;

        const warningsGridController = new Core.list.GridView({
            columns: this.__getWarningsColumns(),
            excludeActions: 'all',
            collection: this.model.get('warnings')
        });
        const warningsGrid = warningsGridController;

        const infoGridController = new Core.list.GridView({
            columns: this.__getInfoColumns(),
            excludeActions: 'all',
            collection: this.model.get('info')
        });
        const infoGrid = infoGridController;

        this.listenTo(errorsGridController, 'dblclick', model => {
            const cursorPos = {
                ch: model.get('column') - 2,
                line: model.get('line') - 1
            };
            this.trigger('changeCursorPos', cursorPos, 'error');
        });
        this.listenTo(warningsGridController, 'dblclick', model => {
            const cursorPos = {
                ch: model.get('column') - 2,
                line: model.get('line') - 1
            };
            this.trigger('changeCursorPos', cursorPos, 'warning');
        });
        this.listenTo(infoGridController, 'dblclick', model => {
            const cursorPos = {
                ch: model.get('column') - 2,
                line: model.get('line') - 1
            };
            this.trigger('changeCursorPos', cursorPos, 'info');
        });

        const tabsPanelsView = new Core.layout.TabLayout({
            tabs: this.__getTabs(errorsGrid, warningsGrid, infoGrid)
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
                width: 0.1
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.WARNINGS.MESSAGE'),
                key: 'message',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.35
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.WARNINGS.WARNINGLEVEL'),
                key: 'warningLevel',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.25
            }
        ];
    },

    __getInfoColumns() {
        return [
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.INFO.LINE'),
                key: 'line',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.15
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.INFO.COLUMN'),
                key: 'column',
                type: Core.meta.objectPropertyTypes.INTEGER,
                autocommit: true,
                width: 0.15
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.INFO.MESSCODE'),
                key: 'messcode',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.2
            },
            {
                title: LocalizationService.get('CORE.FORM.EDITORS.CODE.OUTPUT.INFO.MESSAGE'),
                key: 'message',
                type: Core.meta.objectPropertyTypes.STRING,
                autocommit: true,
                width: 0.5
            }
        ];
    },

    __getTabs(errorsGrid, warningsGrid, infoGrid) {
        return [
            {
                id: 'tab1',
                name: LocalizationService.get('CORE.FORM.EDITORS.CODE.ERRORS'),
                view: errorsGrid
            },
            {
                id: 'tab2',
                name: LocalizationService.get('CORE.FORM.EDITORS.CODE.WARNINGS'),
                view: warningsGrid
            },
            {
                id: 'tab3',
                name: LocalizationService.get('CORE.FORM.EDITORS.CODE.INFO'),
                view: infoGrid
            }
        ];
    }
});
