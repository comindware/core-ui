
import template from '../templates/popup.html';

import ExpressionView from '../views/ExpressionView';
import ScriptView from '../views/ScriptView';

export default Marionette.LayoutView.extend({
    initialize(options) {
        this.value = options.value;
        this.model = new Backbone.Model();
        this.model.set({
            titleText: this.value.type === 'expression'
                ? Localizer.get('CORE.FORM.EDITORS.EXPRESSION.DEFINEEXPRESSION')
                : Localizer.get('CORE.FORM.EDITORS.EXPRESSION.DEFINESCRIPT')
        });
    },

    template: Handlebars.compile(template),

    className: 'l-popup',

    events: {
        'click .js-reject': '__reject',
        'click .js-accept': '__accept'
    },

    regions: {
        contentRegion: '.js-content-region'
    },

    getValue() {
        return this.value;
    },

    __createView() {
        if (this.value.type === 'expression') {
            this.view = new ExpressionView();
        } else {
            this.view = new ScriptView();
        }
    },

    __reject() {
        Core.services.WindowService.closePopup();
    },

    __accept() {
        this.trigger('accept', this.view.getValue());
        Core.services.WindowService.closePopup();
    },

    onShow() {
        this.__createView();
        this.view.setValue(this.value.value);
        this.contentRegion.show(this.view);
    }
});
