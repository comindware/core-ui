//@flow
import meta from '../meta';
import template from '../templates/customActionItem.html';

export default Marionette.View.extend({
    className: meta.className,

    template: Handlebars.compile(template),

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        this.trigger('action:click', this.model);
    }
});
