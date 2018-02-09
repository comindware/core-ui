
import { Handlebars } from 'lib';
import template from '../../reference/templates/referenceButton.hbs';

const classes = {
    ARROW_BUTTON: 'input_dropdown'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
    },
    
    template: Handlebars.compile(template),

    templateContext() {
        const value = this.model.get('value');
        return {
            hasValue: Boolean(value),
            valueUrl: value ? this.options.createValueUrl(value) : false,
            text: this.options.getDisplayText(value),
            showEditButton: this.options.showEditButton && Boolean(value)
        };
    },

    ui: {
        text: '.js-text',
        clearButton: '.js-clear-button',
        editButton: '.js-edit-button'
    },

    events: {
        'click @ui.clearButton': '__clear',
        'click @ui.editButton': '__edit',
        click: '__click'
    },

    __clear() {
        this.reqres.trigger('value:clear');
        return false;
    },

    __edit() {
        if (this.reqres.trigger('value:edit', this.model.get('value'))) {
            return false;
        }
        return null;
    },

    modelEvents: {
        'change:value': 'render',
        'change:enabled': 'updateView',
        'change:readonly': 'updateView'
    },

    __click(e) {
        if (e.target.tagName === 'A') {
            return;
        }
        this.reqres.trigger('panel:open');
    },

    updateView() {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.$el.addClass(classes.ARROW_BUTTON);
            this.ui.clearButton.show();
        } else if (this.model.get('readonly')) {
            this.$el.removeClass(classes.ARROW_BUTTON);
            this.ui.clearButton.hide();
        } else if (!this.model.get('enabled')) {
            this.$el.addClass(classes.ARROW_BUTTON);
            this.ui.clearButton.hide();
        }
    },

    onRender() {
        this.updateView();
    }
});
