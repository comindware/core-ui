//@flow
import meta from '../meta';
import template from '../templates/customActionItem.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: meta.className,

    triggers: {
        click: 'click:item'
    },

    onRender() {
        if (this.model.get('type') === 'Splitter') {
            this.$el.css({ height: '1px', pointerEvents: 'none' });
        }
    }
});
