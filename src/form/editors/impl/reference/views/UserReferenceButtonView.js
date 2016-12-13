import { Handlebars } from '../../../../../libApi';
import ReferenceButtonView from './ReferenceButtonView';
import template from '../templates/userReferenceButton.hbs';

export default ReferenceButtonView.extend({
    template: Handlebars.compile(template),

    className: 'popout-field-user',

    templateHelpers: function () {
        let value = this.model.get('value');
        return {
            text: this.options.getDisplayText(value),
            avatarUrl: value && value.get('avatarUrl'),
            abbreviation: value && value.get('abbreviation')
        };
    },

    updateView: function () {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.ui.clearButton.show();
        } else if (this.model.get('readonly')) {
            this.ui.clearButton.hide();
        } else if (!this.model.get('enabled')) {
            this.ui.clearButton.hide();
        }
    }
});
