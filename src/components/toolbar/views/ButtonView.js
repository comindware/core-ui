import template from '../templates/button.html';
import { severity } from '../meta';

const classes = {
    PALE: 'btn-pale',
    STRONG: 'btn-strong',
    DISABLED: 'btn-disabled',
    SOLID: 'btn-solid'
};

function unCapitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    triggers: {
        mouseenter: 'mouseenter'
    },

    templateContext() {
        return {
            isMobile: this.options.mode === 'Mobile',
            showName: this.options.isPopup || ((this.options.showName || !this.model.get('iconClass')) && this.model.get('name')),
            displayName: this.options.isPopup ? this.model.get('name') ?? this.model.get('description') : this.model.get('name')
        };
    },

    tagName() {
        const url = this.model.get('url');
        return url ? 'a' : 'div';
    },

    attributes() {
        const attributes = {
            tabindex: 0,
            title: this.model.get('description') || this.model.get('name') || ''
        };
        const url = this.model.get('url');
        if (url) {
            attributes.href = url;
        }

        return attributes;
    },

    className() {
        const isCancel = this.model.get('isCancel') || this.model.get('id') === false;
        const severityLevel = isCancel ? null : this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.Default;
        const type = this.model.get('type');
        const typeClass = typeof type === 'string' ? unCapitalizeFirstLetter(type) : 'withoutType';
        const cancelClass = isCancel ? classes.PALE : null;
        const solidClass = this.model.get('isSolid') ? classes.SOLID : '';

        let enabled = this.model.get('enabled');
        if (enabled === undefined) {
            enabled = true;
        } else if (typeof enabled === 'function') {
            enabled = enabled();
        }

        const useName = this.model.get('name') || this.options.isPopup;

        return `${severityItem.class} ${this.model.get('class') || ''} ${useName ? '' : 'toolbar-btn_withoutName'} ${cancelClass || ''} toolbar-btn_${typeClass} ${enabled ? '' : classes.DISABLED} ${solidClass}`;
    }
});
