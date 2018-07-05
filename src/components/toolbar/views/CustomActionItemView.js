//@flow
import { severity } from '../meta';
import template from '../templates/customActionItemView.html';

const classes = {
    checked: 'editor_checked'
};

export default Marionette.View.extend({
    className: 'toolbar-btn',

    template: Handlebars.compile(template),
    
    ui: {
        checkbox: '.js-checkbox'
    },

    onRender() {
        const iconClass = this.model.get('iconClass');
        const severityLevel = this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.None;

        this.$el.addClass(severityItem.class);
        if (iconClass) {
            const icon = `<i class="fa fa-${iconClass}" aria-hidden="true"></i>`;
            this.$el.children('.js-icon-container').html(icon);
        }

        this.__updateState();
    },

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        this.trigger('action:click', this.model);
    },

    __updateState() {
        if (this.model.get('checked')) {
            this.ui.checkbox.addClass(classes.checked);
        } else {
            this.ui.checkbox.removeClass(classes.checked);
        }
    }
});
