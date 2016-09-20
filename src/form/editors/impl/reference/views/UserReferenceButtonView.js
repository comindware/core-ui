import BaseReferenceButtonView from './ReferenceButtonView';
import template from '../templates/userReferenceButton.hbs';

export default BaseReferenceButtonView.extend({
    template: template,

    className: 'popout-field-user',

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