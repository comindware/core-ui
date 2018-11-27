//@flow
import ActionView from './ActionView';

export default ActionView.extend({
    ui: {
        check: '.js-check'
    },

    classes: {
        CHECKED: 'editor_checked'
    },

    templateContext() {
        return {
            checkbox: true
        };
    },

    onRender() {
        this.ui.check.toggleClass(this.classes.CHECKED, !!this.model.get('isChecked'));
    },

    __handleClick() {
        const newState = !this.model.get('isChecked');
        this.model.set('isChecked', newState);
        this.ui.check.toggleClass(this.classes.CHECKED, newState);
        this.trigger('action:click', this.model);
    }
});
