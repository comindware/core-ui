//@flow
import ButtonView from './ButtonView';

export default ButtonView.extend({
    events: {
        click: '__handleClick'
    },

    __handleClick() {
        this.trigger('action:click', this.model);
    }
});
