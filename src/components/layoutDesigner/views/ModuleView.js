//@flow
import ElementsPaletteView from './elementPalette/ElementsPaletteView';
import template from '../templates/module.html';
import CanvasController from '../controllers/CanvasController';
import ClonePopoutButtonView from './toolbar/ClonePopoutButtonView';
import ClonePopoutPanelView from './toolbar/ClonePopoutPanelView';
import SaveAsView from './toolbar/SaveAsView';
import { defaultToolbarButtonId, defaultToolbarButton } from '../meta';

const constants = {
    MIN_WIDTH: 150
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.componentReqres = options.componentReqres;
        this.components = options.properties.components || {};
        this.paletteCollection = options.palette.collection;
        this.configurationModel = options.configurationModel;

        const paletteClass = ` dev-palette-${(options.palette && options.palette.size) || 'medium'}`;
        const propertiesClass = ` dev-properties-${(options.properties && options.properties.size) || 'medium'}`;
        this.model.set({ paletteClass, propertiesClass });

        this.elementsPaletteView = new ElementsPaletteView({
            config: this.getOption('palette'),
            context: this.model.get('context'),
            recordTypeId: this.model.get('recordTypeId'),
            reqres: this.reqres
        });

        this.formModel = this.model.get('form');

        this.canvasController = new CanvasController({
            model: this.formModel,
            config: this.getOption('canvas'),
            reqres: this.reqres,
            componentReqres: this.getOption('componentReqres')
        });
        this.__createToolbarView();
    },

    className: 'layout-design',

    template: Handlebars.compile(template),

    ui: {
        palleteResizer: '.js-palette-resizer',
        propertiesResizer: '.js-properties-resizer',
        palette: '.js-palette-container',
        properties: '.js-properties-region',
        toolbar: '.js-toolbar'
    },

    regions: {
        paletteTabsRegion: '.js-palette-tabs-region',
        paletteContainer: '.js-palette-container',
        canvasRegion: '.js-canvas-region',
        propertiesRegion: '.js-properties-region',
        toolbarRegion: '.js-designer-toolbar-region'
    },

    onRender() {
        this.listenTo(this.canvasController, 'component:selected', this.__showComponentProperties);
        this.listenTo(this.canvasController, 'remove:attribute', event => this.trigger('remove:attribute', event));
        this.listenTo(this.elementsPaletteView, 'handle:action', actionId => this.trigger('handle:action', actionId));
        this.listenTo(this.elementsPaletteView, 'edit:attribute', event => this.trigger('edit:attribute', event));
        this.listenTo(this.elementsPaletteView, 'remove:attribute', event => this.trigger('remove:attribute', event));
        this.listenTo(this.elementsPaletteView, 'element:drag:start', this.canvasController.handleElementDragStart);
        this.listenTo(this.elementsPaletteView, 'element:drag:stop', this.canvasController.handleElementDragStop);
        this.listenTo(this.elementsPaletteView, 'element:drag:move', this.canvasController.handleElementDragMove);
        this.listenTo(this.elementsPaletteView, 'element:dblclick', model => this.canvasController.handleElementDblclick(model));
        this.listenTo(this.elementsPaletteView, 'context:toggle', this.canvasController.handleElementDragMove);
        this.listenTo(this.elementsPaletteView, 'toggle:palette', this.__togglePalette);
        this.listenTo(this.elementsPaletteView, 'handle:add', event => this.trigger('handle:add', event));
        this.listenTo(this.elementsPaletteView, 'handle:edit', event => this.trigger('handle:edit', event));
        this.listenTo(Core.services.GlobalEventService, 'window:resize', this.__updateResizersPosition);

        this.getRegion('canvasRegion').show(this.canvasController.view);
        this.getRegion('paletteTabsRegion').show(this.elementsPaletteView);

        this.ui.palleteResizer.draggable({
            axis: 'x',
            drag: (event, ui) => this.__onPaletteResizerDrag(ui),
            stop: () => this.__onDragStop()
        });

        this.ui.propertiesResizer.draggable({
            axis: 'x',
            drag: (event, ui) => this.__onPropertiesResizerDrag(ui),
            stop: () => this.__onDragStop()
        });

        const paletteWidth = this.configurationModel.get('paletteWidth');
        if (paletteWidth) {
            this.ui.palette.css('flex', `0 0 ${paletteWidth}px`);
        }
        const propertiesWidth = this.configurationModel.get('propertiesWidth');
        if (propertiesWidth) {
            this.ui.properties.css('flex', `0 0 ${propertiesWidth}px`);
        }

        if (this.getOption('canvas').dropZoneType !== 'fixed') {
            this.ui.propertiesResizer.hide();
        }
        this.__updateResizersPosition();

        if (this.getOption('canvas').focusOnShow) {
            this.canvasController.selectCanvasComponent(this.formModel.get('root'));
        } else {
            this.ui.properties.hide();
        }

        if (!this.options.detachedToolbar) {
            this.showChildView('toolbarRegion', this.toolbar);
        } else {
            this.ui.toolbar.hide();
        }
    },

    toggleMask(isShowed) {
        this.canvasController.view.toggleMask(isShowed);
    },

    updatePalette(model, newCollection) {
        this.elementsPaletteView.updatePalette(model, newCollection);
    },

    getToolbar() {
        return this.toolbar;
    },

    __createToolbarView() {
        return this.__createToolbar(this.getOption('toolbar'));
    },

    __updateResizersPosition() {
        this.ui.palleteResizer.css('left', this.ui.palette.outerWidth());
        this.ui.propertiesResizer.css('left', this.$el.width() - this.ui.properties.outerWidth());
    },

    __onPaletteResizerDrag(ui) {
        const palette = this.ui.palette;
        let width = ui.offset.left - palette.offset().left;
        if (width < constants.MIN_WIDTH) {
            ui.position.left = width = constants.MIN_WIDTH;
        }

        const otherElementsMinWidth = constants.MIN_WIDTH + this.ui.properties.outerWidth();
        const maxWidth = this.$el.width() - otherElementsMinWidth;
        if (width > maxWidth) {
            ui.position.left = width = maxWidth;
        }
        palette.css('flex', `0 0 ${width}px`);
        this.configurationModel.set('paletteWidth', width);
    },

    __onPropertiesResizerDrag(ui) {
        const properties = this.ui.properties;
        const totalWidth = this.$el.width();
        let width = totalWidth - ui.position.left;
        if (width < constants.MIN_WIDTH) {
            width = constants.MIN_WIDTH;
            ui.position.left = totalWidth - width;
        }

        const otherElementsMinWidth = constants.MIN_WIDTH + this.ui.palette.outerWidth();
        const maxWidth = this.$el.width() - otherElementsMinWidth;
        if (width > maxWidth) {
            width = maxWidth;
            ui.position.left = otherElementsMinWidth;
        }
        properties.css('flex', `0 0 ${width}px`);
        this.configurationModel.set('propertiesWidth', width);
    },

    __onDragStop() {
        const configuration = this.configurationModel.toJSON();
        $.jStorage.set(configuration.id, configuration);
    },

    __showComponentProperties(model) {
        const view = this.components[model.get('fieldType')];

        if (view) {
            const propertiesRegion = this.getRegion('propertiesRegion');
            this.ui.properties.show();
            propertiesRegion.show(
                new view(
                    Object.assign(this.model.toJSON(), {
                        model,
                        reqres: this.reqres,
                        operations: this.paletteCollection,
                        componentReqres: this.getOption('componentReqres')
                    })
                )
            );
            this.listenTo(model, 'deselected', () => {
                propertiesRegion.currentView && propertiesRegion.currentView.destroy();
                propertiesRegion.empty();
                propertiesRegion.reset();
            });
        }
    },

    async __save() {
        const confirm = await Core.services.MessageService.showMessageDialog(Localizer.get('PROCESS.FORMDESIGNER.CONFIRMSAVE.TITLE'), '', [
            {
                id: true,
                text: Localizer.get('PROCESS.FORMDESIGNER.CONFIRMSAVE.OK')
            },
            {
                id: false,
                text: Localizer.get('PROCESS.FORMDESIGNER.CONFIRMSAVE.CANCEL'),
                default: true
            }
        ]);

        if (confirm) {
            this.trigger('toolbar:execute', 'save');
        }
    },

    __saveAs() {
        const form = this.formModel;
        const model = new Backbone.Model({
            alias: `new${form.get('alias')}`
        });
        const saveAsView = new SaveAsView({
            model
        });
        this.listenTo(saveAsView, 'accept', aliasModel => {
            form.set({
                name: aliasModel.get('name'),
                alias: aliasModel.get('alias')
            });
            delete form.id;
            this.trigger('toolbar:execute', 'saveAs');
        });
        Core.services.WindowService.showPopup(saveAsView);
    },

    async __clear() {
        const confirm = await Core.services.MessageService.confirm(Localizer.get('PROCESS.FORMDESIGNER.CLEAR.CONFIRMCLEAR'));
        if (confirm) {
            this.trigger('toolbar:execute', 'clear');
        }
    },

    __togglePalette() {
        this.$el.find('.js-palette-container').toggleClass('ld-view__list_collapsed');
    },

    __createToolbar(options) {
        const allItemsCollection = new Backbone.Collection(defaultToolbarButton);
        if (options.excludeActions) {
            options.excludeActions.forEach(action => allItemsCollection.remove(allItemsCollection.get(action)));
        }

        if (options.additionalActions) {
            allItemsCollection.add(options.additionalActions);
        }

        const cloneItems = allItemsCollection.get('clone');
        if (cloneItems) {
            cloneItems.set('options', {
                collection: this.__createPopupCollection(),
                buttonView: ClonePopoutButtonView,
                panelView: ClonePopoutPanelView
            });
        }

        const toolbar = (this.toolbar = new Core.components.Toolbar({
            allItemsCollection,
            reqres: this.componentReqres
        }));

        this.listenTo(toolbar, 'command:execute', model => {
            const id = model.get('id');
            switch (id) {
                case defaultToolbarButtonId.SAVE:
                    this.__save();
                    break;
                case defaultToolbarButtonId.SAVE_AS:
                    this.__saveAs();
                    break;
                case defaultToolbarButtonId.CLEAR:
                    this.__clear();
                    break;
                case 'create':
                    this.__showComponentProperties(model);
                    break;
                default:
                    this.trigger('toolbar:execute', id);
                    break;
            }
        });

        return toolbar;
    },

    __createPopupCollection() {
        return this.componentReqres.request('toolbarItems:get');
    }
});
