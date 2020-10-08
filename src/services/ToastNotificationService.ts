import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import NotificationCollectionView from '../views/NotificationCollectionView';

const defaultTimeOfShow = 12000;

type optionsType = {
    toastNotificationRegion: Marionette.Region
};

enum notificationTypes {
    INFO = 'Info',
    ERROR = 'Error',
    SUCCESS = 'Success'
};

type messageTypes = string | {
    text: string,
    title: string
}

export default class ToastNotificationService {
    static options: optionsType;
    static notificationCollection: Backbone.Collection;
    private static __onInitializeNotificationQueue: Array<Array<messageTypes | notificationTypes | object>> = [];
    static notificationTypes: {
        INFO: notificationTypes.INFO,
        ERROR: notificationTypes.ERROR,
        SUCCESS: notificationTypes.SUCCESS
    };

    static initialize(options: optionsType) {
        this.notificationCollection = new Backbone.Collection();

        options.toastNotificationRegion.show(
            new NotificationCollectionView({
                collection: this.notificationCollection
            })
        );

        this.notificationTypes = {
            INFO: notificationTypes.INFO,
            ERROR: notificationTypes.ERROR,
            SUCCESS: notificationTypes.SUCCESS
        };
        Object.assign(this, Backbone.Events);

        this.__onInitializeNotificationQueue.forEach((args: Array<any>): void => this.add(args[0], args[1], args[2]));
    }

    static add(message: messageTypes, type = notificationTypes.SUCCESS, options = { time: defaultTimeOfShow }) {
        if (!this.notificationCollection) {
            this.__onInitializeNotificationQueue.push([message, type, options]);
            return;
        }
        if (!message) {
            return;
        }
        let text: string;
        let title: string | null;
        if (typeof message == 'string') {
            text = message;
            title = null;
        } else if (typeof message === 'object' && message !== null) {
            text = message.text;
            title = message.title;
        } else {
            console.warn(`Unexpected "message" type = "${typeof message}"`)
            return;
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
            severity: type || notificationTypes.INFO,
            options
        });
    }
}
