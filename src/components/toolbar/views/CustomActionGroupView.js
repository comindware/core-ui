//@flow
import template from '../templates/customActionGroupView.html';
import meta from '../meta';

export default Marionette.CollectionView.extend({
    className: 'js-toolbar-items-container toolbar-items-wrp',

    template: Handlebars.compile(template),

    childView(model) {
        return meta.getViewByModel(model);
    },

    childViewOptions() {
        return {
            reqres: this.getOption('reqres')
        };
    },

    childViewEvents: {
        'action:click': '__handleClick'
    },

    __handleClick(model, options) {
        this.trigger('actionSelected', model, options);
    }
});
