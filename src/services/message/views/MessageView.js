import template from '../templates/message.hbs';
import WindowService from '../../WindowService';

export default Marionette.View.extend({
    className: 'msg-popup',

    ui: {
        buttons: '.js-buttons'
    },

    events: {
        'click @ui.buttons': '__onSelect'
    },

    template: Handlebars.compile(template),

    close(result) {
        WindowService.closePopup();
        this.trigger('close', result);
    },

    __onSelect(e) {
        const index = this.ui.buttons.index(e.target);
        const buttonModel = this.model.get('buttons')[index];
        const result = buttonModel.id;
        this.close(result);
    }
});
