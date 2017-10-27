/**
 * Developer: Ksenia Kartvelishvili
 * Date: 20.11.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import NotificationCollectionView from './toastNotification/views/NotificationCollectionView';

const defaultTimeOfShow = 12000;

export default class ToastNotificationService {
    static initialize(options = {}) {
        this.notificationCollection = new Backbone.Collection();
        options.toastNotificationRegion.show(new NotificationCollectionView({
            collection: this.notificationCollection
        }));
        options.toastNotificationRegionEl.show();
        this.notificationTypes = {
            INFO: 'Info',
            ERROR: 'Error',
            SUCCESS: 'Success'
        };
        Object.assign(this, Backbone.Events);
    }

    static add(message, type, time) {
        if (!message) {
            return;
        }
        let text = message;
        let title = null;
        if (_.isObject(message)) {
            text = message.text;
            title = message.title;
        }
        this.notificationCollection.add(new Backbone.Model({
            type,
            title,
            text,
            time: time === 0 ? time : time || defaultTimeOfShow
        }), { at: this.notificationCollection.length });

        this.trigger('publish:notification', {
            message: title || text,
            affectedText: title ? text : '',
            severity: type || 'Info'
        });
    }
}
