//@flow
import { severity } from '../meta';
import template from '../templates/customActionItemView.html';

export default Marionette.ItemView.extend({
    className: 'toolbar-btn',

    template: Handlebars.compile(template),

    onRender() {
        const iconClass = this.model.get('iconClass');
        const severityLevel = this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.None;

        this.$el.addClass(severityItem.class);
        if (iconClass) {
            const icon = `<i class="fa fa-${iconClass}" aria-hidden="true"></i>`;
            this.$el.children('.js-icon-container').html(icon);
        }
    },

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        this.trigger('action:click', this.model);
    }
});
