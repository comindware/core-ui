import { getClassName } from '../../meta';
import keyCode from '../../../../utils/keyCode';
import template from '../../templates/splitButtonMenuAnchor.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    events: {
        click: '__handleClick',
        keyup: '__keyup'
    },

    templateContext() {
        return {
            iconClass: this.options.iconClass
        };
    },

    className() {
        return getClassName('split-button-menu-anchor', this.model);
    },

    __keyup(event) {
        if ([keyCode.ENTER, keyCode.SPACE].includes(event.keyCode)) {
            this.open();
        }
    }
});
