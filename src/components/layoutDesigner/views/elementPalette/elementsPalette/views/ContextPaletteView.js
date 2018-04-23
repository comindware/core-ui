//@flow
import template from '../templates/customContextPalette.html';
import CustomAttributesView from './CustomAttributesView';
import ContextModel from '../../../../models/ContextModel';

export default Marionette.View.extend({
    initialize() {
        this.reqres = this.options.reqres;

        _.bindAll(this, '__onDragStart', '__onDragStop', '__onDragMove');

        this.__refreshModel(this.options.context);
    },

    className: 'region',

    template: Handlebars.compile(template),

    regions: {
        customAttributesRegion: '.js-custom-attributes-region'
    },

    updatePalette(model) {
        this.__refreshModel(model.get('context'), model.get('userCommands'));
        this.render();
    },

    childViewOptions() {
        return {
            reqres: this.reqres
        };
    },

    onRender() {
        const customAttributesView = new CustomAttributesView({
            reqres: this.reqres,
            collection: this.customCollection,
            isStaticTree: this.options.config.isStaticTree,
            iconsProperty: this.options.config.iconsProperty,
            displayPaletteAttribute: this.options.config.displayPaletteAttribute
        });
        this.listenTo(customAttributesView, 'element:drag:start', this.__onDragStart);
        this.listenTo(customAttributesView, 'element:drag:stop', this.__onDragStop);
        this.listenTo(customAttributesView, 'element:drag:move', this.__onDragMove);
        this.listenTo(customAttributesView, 'element:dblclick', this.__onDblClick);
        this.listenTo(customAttributesView, 'context:toggle', this.__onContextToggle);

        this.showChildView('customAttributesRegion', customAttributesView);
        this.trigger('toolbar:update:searchModel', this.customCollection);
    },

    __onDragStart(view, dragContext, event, ui) {
        this.trigger('element:drag:start', view, dragContext, event, ui);
    },

    __onDragStop(view, dragContext, event, ui) {
        this.trigger('element:drag:stop', view, dragContext, event, ui);
    },

    __onDragMove(view, dragContext, event, ui) {
        this.trigger('element:drag:move', view, dragContext, event, ui);
    },

    __onDblClick(model) {
        this.trigger('element:dblclick', model);
    },

    __onContextToggle() {
        this.trigger('updateScroller');
        this.trigger('scrollToBottom');
    },

    __refreshModel(model, staticModel) {
        if (model) {
            const contextModel = new ContextModel({
                instanceTypeId: this.options.recordTypeId,
                context: model,
                propertyTypes: [],
                usePropertyTypes: false
            });
            contextModel.populateChildren();
            this.customCollection = contextModel.get('children');

            const staticCollection = staticModel || this.options.config.collection;
            if (staticCollection) {
                this.customCollection.add(staticCollection.models);
            }
        } else {
            this.customCollection = new Core.collections.VirtualCollection(this.getOption('config').collection);
        }
    }
});
