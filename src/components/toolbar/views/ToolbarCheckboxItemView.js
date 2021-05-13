import ActionView from './ActionView';

const checkedIcon = '<i class="fas fa-check"></i>';

export default ActionView.extend({
    ui: {
        checkbox: '.js-checkbox'
    },

    templateContext() {
        return Object.assign(
            ActionView.prototype.templateContext.apply(this, arguments),
            {
                checkbox: true,
                showName: this.model.get('name')
            }
        );
    },

    onRender() {
        this.__toggleIcon(!!this.model.get('isChecked'));
    },

    __handleClick() {
        const newState = !this.model.get('isChecked');
        this.model.set('isChecked', newState);
        this.__toggleIcon(newState);
        this.trigger('action:click', this.model);
    },

    __toggleIcon(state) {
        const checkboxEl = this.ui.checkbox.get(0);
        checkboxEl.innerHTML = state ? checkedIcon: '';
    }
});
