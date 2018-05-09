//@flow
import template from './elementsPalette/templates/elementsPalette.html';
import PaletteToolbarView from './elementsPalette/views/PaletteToolbarView';
import ContextPaletteView from './elementsPalette/views/ContextPaletteView';
import IconPaletteView from './elementsPalette/views/IconPaletteView';

export default Marionette.View.extend({
    initialize(options) {
        this.config = options.config;
        const collection = options.config.elementsCollection;

        if (collection) {
            this.elementsView = this.__createContextView({
                config: { collection },
                showPaletteAsIcons: options.config.showPaletteAsIcons,
                reqres: options.reqres
            });
            this.listenTo(this.elementsView, 'element:drag:start', (dragContext, event, ui) => this.trigger('element:drag:start', dragContext, event, ui));
            this.listenTo(this.elementsView, 'element:drag:stop', (dragContext, event, ui) => this.trigger('element:drag:stop', dragContext, event, ui));
            this.listenTo(this.elementsView, 'element:drag:move', (dragContext, event, ui) => this.trigger('element:drag:move', dragContext, event, ui));
            this.listenTo(this.elementsView, 'context:toggle', () => this.trigger('context:toggle'));
        }

        if (this.config.toolbar) {
            this.listView = this.__createContextView(this.options);
            this.toolbarView = this.__createToolbarView(options.reqres, this.config);

            this.listenTo(this.listView, 'toolbar:update:searchModel', toolbarCollection => this.toolbarView.updateSearchModel(toolbarCollection));
            this.listenTo(this.listView, 'element:drag:start', (dragContext, event, ui) => this.trigger('element:drag:start', dragContext, event, ui));
            this.listenTo(this.listView, 'element:drag:stop', (dragContext, event, ui) => this.trigger('element:drag:stop', dragContext, event, ui));
            this.listenTo(this.listView, 'element:drag:move', (dragContext, event, ui) => this.trigger('element:drag:move', dragContext, event, ui));
            this.listenTo(this.listView, 'element:dblclick', model => this.trigger('element:dblclick', model));
            this.listenTo(this.listView, 'context:toggle', () => this.trigger('context:toggle'));
            this.listenTo(this.listView, 'show:attribute', () => this.trigger('show:attribute'));
            this.listenTo(this.toolbarView, 'execute', actionId => this.trigger('handle:action', actionId));
        }

        options.reqres.reply('handle:edit', event => this.trigger('handle:edit', event));
        options.reqres.reply('add:attribute', event => this.trigger('add:attribute', event));
        options.reqres.reply('remove:attribute', event => this.trigger('remove:attribute', event));
    },

    template: Handlebars.compile(template),

    className: 'ld-list',

    ui: {
        toggleButton: '.js-palette-toggle-button'
    },

    events: {
        'click @ui.toggleButton': '__togglePalette'
    },

    regions: {
        toolbarRegion: '.js-toolbar-region',
        listRegion: '.js-list-region',
        elementsRegion: '.js-elements-region'
    },

    onRender() {
        if (this.config.showList !== false && this.config.toolbar) {
            this.showChildView('listRegion', this.listView);
            this.showChildView('toolbarRegion', this.toolbarView);
        }
        if (this.elementsView) {
            this.showChildView('elementsRegion', this.elementsView);
        }
        this.ui.toggleButton.hide(); //hide feature
    },

    updatePalette(model, newCollection) {
        this.listView.updatePalette(model, newCollection);
    },

    __createToolbarView(reqres, config) {
        return new PaletteToolbarView({ reqres, config });
    },

    __togglePalette() {
        this.trigger('toggle:palette');
        this.ui.toggleButton.toggleClass('dev-button-rotated');
    },

    __createContextView(options) {
        let paletteView;
        if (options.showPaletteAsIcons) {
            const collection = new Core.collections.VirtualCollection(options.config.collection);
            paletteView = new IconPaletteView({
                reqres: options.reqres,
                collection
            });
        } else {
            paletteView = new ContextPaletteView(options);
        }

        return paletteView;
    }
});
