import template from '../templates/button.html';
import { severity } from '../meta';

const classes = {
    PALE: 'btn-pale',
    STRONG: 'btn-strong',
    DISABLED: 'btn-disabled'
};

function unCapitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            isMobile: this.options.mode === 'Mobile',
            showName: (this.options.showName || !this.model.get('iconClass')) && this.model.get('name')
        };
    },

    attributes() {
        return {
            tabindex: 0,
            title: this.model.get('description') || this.model.get('name') || ''
        };
    },

    className() {
        const isCancel = this.model.get('isCancel') || this.model.get('id') === false;
        const severityLevel = isCancel ? null : this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.Default;
        const type = this.model.get('type');
        const typeClass = typeof type === 'string' ? unCapitalizeFirstLetter(type) : 'withoutType';
        const cancelClass = isCancel ? classes.PALE : null;
        let enabled = this.model.get('enabled');
        if (enabled === undefined) {
            enabled = true;
        } else if (typeof enabled === 'function') {
            enabled = enabled();
        }

        const name = this.model.get('name');

        return `${severityItem.class} ${this.model.get('class') || ''} ${name ? '' : 'toolbar-btn_withoutName'} ${cancelClass || ''} toolbar-btn_${typeClass} ${enabled ? '' : classes.DISABLED}`;
    }
});
