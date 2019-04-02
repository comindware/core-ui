import FunctionOverloadView from './FunctionOverloadView';
import FunctionParametersView from '../views/FunctionParametersView';
import template from '../templates/functionTooltip.html';

const FUNCTION_ITEM_HEIGHT = 25;
const FUNCTIONS_MAX_ROWS = 10;

export default Marionette.View.extend({
    className: 'dev-code-editor-tooltip',

    regions: {
        functionOverloadsRegion: '.js-function-overloads-container',
        functionParametersRegion: '.js-function-parameters-container'
    },

    events: {
        keydown: '__onKeydown'
    },

    template: Handlebars.compile(template),

    onAttach() {
        const collection = new Backbone.Collection(this.model.get('overloads'));
        this.functionOverloads = new Core.list.GridView({
            collection: new Core.collections.VirtualCollection(collection),
            childView: FunctionOverloadView,
            childHeight: FUNCTION_ITEM_HEIGHT,
            height: 'auto',
            maxRows: FUNCTIONS_MAX_ROWS
        });
        this.functionOverloads.on('childview:selected', model => {
            this.showChildView('functionParametersRegion', new FunctionParametersView({ model }));
        });
        this.functionOverloads.on('childview:peek', () => this.trigger('peek'));
        this.showChildView('functionOverloadsRegion', this.functionOverloads);

        if (this.options.isFull) {
            collection.at(0).select();
        }
    },

    setPosition(position) {
        this.$el.css('top', position.top);
        this.$el.css('left', position.left);
    },

    __onKeydown(e) {
        if (e.keyCode === 9 || e.keyCode === 13) {
            this.trigger('peek');
        }
    }
});
