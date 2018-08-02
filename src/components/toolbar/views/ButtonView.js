import template from '../templates/button.html';
import { severity } from '../meta';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className() {
        const severityLevel = this.model.get('severity');
        const severityItem = severity[severityLevel] || severity.None;
    
        return `${severityItem.class} ${this.model.get('class') || ''}`;
    }
});
