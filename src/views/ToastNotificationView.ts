import template from './templates/toastNotification.html';
import Marionette from 'backbone.marionette';

const notificationTypes = {
    INFO: 'Info',
    ERROR: 'Error',
    SUCCESS: 'Success'
};

export interface IToastNotificationView extends Marionette.View<any> {
    (): void;
}

export default Marionette.View.extend({
    className() {
        const sizeClass = this.model.get('title') ? 'dev-fr-alert-extended' : 'alert-compact';

        switch (this.model.get('type')) {
            case notificationTypes.SUCCESS:
                return `${sizeClass} fr-alert alert_success dev-fr-alert`;
            case notificationTypes.ERROR:
                return `${sizeClass} fr-alert fr-alert_error dev-fr-alert`;
            case notificationTypes.INFO:
            default:
                return `${sizeClass} fr-alert dev-fr-alert`;
        }
    },

    events: {
        click: 'hideView'
    },

    template: Handlebars.compile(template),

    hideView() {
        this.$el.fadeOut(150, () => this.model.collection && this.model.collection.remove(this.model));
    },

    templateContext() {
        const notificationType = this.model.get('type');
        const iconClass = notificationType === notificationTypes.INFO ? 'info-circle' : notificationType === notificationTypes.ERROR ? 'exclamation-circle' : 'check-circle';

        return {
            iconClass,
            iconCloseClass: 'times'
        };
    }
});
