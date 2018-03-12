//@flow
import { severity } from '../meta';
import template from '../templates/IconColorPanelChild.html';

export default Marionette.ItemView.extend({
    template: Handlebars.compile(template),

    triggers: {
        click: 'click:item'
    },

    onRender() {
        this.$el.addClass(severity[this.model.get('severity')].class);
        if (this.model.get('type') === 'Splitter') {
            this.$el.css({ height: '1px', pointerEvents: 'none' });
        }
    }
});
