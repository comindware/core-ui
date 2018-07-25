//@flow
import template from '../templates/customActionItem.html';
import meta from '../meta';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    className: meta.className,

    templateContext() {
        return {
            isGroup: true
        };
    }
});
