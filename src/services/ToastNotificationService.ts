import NotificationCollectionView from '../views/NotificationCollectionView';

const defaultTimeOfShow = 12000;

export default class ToastNotificationService {
    static initialize(options = {}) {
        this.notificationCollection = new Backbone.Collection();

        options.toastNotificationRegion.show(
            new NotificationCollectionView({
                collection: this.notificationCollection
            })
        );

        this.notificationTypes = {
            INFO: 'Info',
            ERROR: 'Error',
            SUCCESS: 'Success'
        };
        Object.assign(this, Backbone.Events);
    }

    static add(message, type = this.notificationTypes.SUCCESS, options = {}) {
        if (!message) {
            return;
        }
        let text = message;
        let title = null;
        if (message instanceof Object) {
            text = message.text;
            title = message.title;
        }
        this.notificationCollection.add(
            new Backbone.Model({
                type,
                title,
                text,
                time: options.time === 0 ? options.time : options.time || defaultTimeOfShow
            }),
            { at: this.notificationCollection.length }
        );

        this.trigger('publish:notification', {
            message: title || text,
            affectedText: title ? text : '',
            severity: type || 'Info',
            options
        });
    }
}
