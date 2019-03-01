//@flow
import template from '../templates/customActionGroupView.html';
import meta from '../meta';

export default Marionette.CollectionView.extend({
    className: 'js-icon-container toolbar-items-wrp',

    template: Handlebars.compile(template),

    childView(model) {
        return meta.getViewByModel(model);
    },

    childViewOptions() {
        return {
            reqres: this.getOption('reqres'),
            mode: this.options.mode,
            showName: this.options.showName
        };
    },

    childViewEvents: {
        'action:click': '__handleCommand',
        search(searchString, { model }) {
            return this.__handleCommand(model, { searchString });
        }
    },

    __handleCommand(model, options) {
        this.trigger('command:execute', model, options);
    }
});
