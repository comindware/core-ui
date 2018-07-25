//@flow
import ButtonView from './ButtonView';

const classes = {
    CHECKED: 'editor_checked'
};

export default ButtonView.extend({
    ui: {
        check: '.js-check'
    },

    templateContext() {
        return {
            checkbox: true
        };
    },

    onRender() {
        if (this.model.get('isChecked')) {
            this.ui.check.toggleClass(classes.CHECKED);
        }
    },

    events: {
        click: '__handleClick'
    },

    __handleClick() {
        const newState = !this.model.get('isChecked');
        this.model.set('isChecked', newState);
        this.trigger('action:click', this.model);
    }
});
