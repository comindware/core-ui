import template from './templates/toastNotification.html';

const notificationTypes = {
    INFO: 'Info',
    WARNING: 'Warning',
    ERROR: 'Error',
    SUCCESS: 'Success'
};

export default Marionette.View.extend({
    className() {
        const sizeClass = this.model.get('title') ? 'dev-fr-alert-extended' : 'alert-compact';

        switch (this.model.get('type')) {
            case notificationTypes.SUCCESS:
                return `${sizeClass} fr-alert alert_success dev-fr-alert`;
            case notificationTypes.ERROR:
                return `${sizeClass} fr-alert fr-alert_error dev-fr-alert`;
            case notificationTypes.WARNING:
                return `${sizeClass} fr-alert fr-alert_warning dev-fr-alert`;
            case notificationTypes.INFO:
            default:
                return `${sizeClass} fr-alert dev-fr-alert`;
        }
    },

    ui: {
        showMoreBtn: '.js-show-more-btn'
    },

    events: {
        click: 'hideView',
        'click@ui.showMoreBtn': 'showMore'
    },

    template: Handlebars.compile(template),

    hideView() {
        this.$el.fadeOut(150, () => this.model.collection && this.model.collection.remove(this.model));
    },

    showMore() {
        this.model.showMore && this.model.showMore();
    },

    templateContext() {
        const notificationType = this.model.get('type');
        const iconClass = notificationType === notificationTypes.INFO ? 'info-circle' : notificationType === notificationTypes.ERROR ? 'exclamation-circle' : 'check-circle';

        return {
            iconClass,
            iconCloseClass: 'times',
            showMore: Boolean(this.model.showMore)
        };
    }
});
