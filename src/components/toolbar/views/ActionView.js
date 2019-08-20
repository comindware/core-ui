import ButtonView from './ButtonView';
import keyCode from '../../../utils/keyCode';

export default ButtonView.extend({
    events: {
        click: '__handleClick',
        keyup: '__keyup'
    },

    __keyup(event) {
        if ([keyCode.ENTER, keyCode.SPACE].includes(event.keyCode)) {
            this.__handleClick();
        }
    },

    __handleClick() {
        this.trigger('action:click', this.model);
    }
});
