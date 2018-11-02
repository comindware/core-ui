import template from '../templates/button.html';
import { severity } from '../meta';

function unCapitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className() {
        const severityLevel = this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.None;
        const type = this.model.get('type');
        const typeClass = typeof type === 'string' ? unCapitalizeFirstLetter(type) : 'withoutType';

        return `${severityItem.class} ${this.model.get('class') || ''} toolbar-btn_${typeClass}`;
    }
});
