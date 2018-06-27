//@flow
import { severity } from '../meta';
import template from '../templates/IconColorPanelChild.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    triggers: {
        click: 'click:item'
    },

    onRender() {
        const severityLevel = this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.None;

        this.$el.addClass(severityItem.class);
        if (this.model.get('type') === 'Splitter') {
            this.$el.css({ height: '1px', pointerEvents: 'none' });
        }
    }
});
