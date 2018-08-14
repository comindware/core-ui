import template from '../templates/toastNotification.html';

const notificationTypes = {
    INFO: 'Info',
    ERROR: 'Error',
    SUCCESS: 'Success'
};

export default Marionette.View.extend({
    className() {
        const sizeClass = this.model.get('title') ? 'dev-fr-alert-extended' : 'dev-fr-alert-compact';

        switch (this.model.get('type')) {
            case notificationTypes.SUCCESS:
                return `${sizeClass} fr-alert dev-alert_success dev-fr-alert`;
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
        this.$el.fadeOut(200, () => this.model.collection && this.model.collection.remove(this.model));
    },

    templateContext() {
        return {
            isInfo: this.model.get('type') === notificationTypes.INFO,
            isError: this.model.get('type') === notificationTypes.ERROR,
            isSuccess: this.model.get('type') === notificationTypes.SUCCESS
        };
    }
});
