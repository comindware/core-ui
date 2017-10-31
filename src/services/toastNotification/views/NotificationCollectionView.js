/**
 * Developer: Vladislav Smirnov
 * Date: 23.01.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import ToastNotificationView from './ToastNotificationView';

const maxNotification = 5;

export default Marionette.CollectionView.extend({
    childEvents: {
        'view:click': '__hideView'
    },

    className: 'dev-notification-container',

    childView: ToastNotificationView,

    onAddChild(view) {
        if (this.collection.length > maxNotification) {
            this.collection.remove(this.children.findByIndex(0).model);
        } else if (this.collection.length > maxNotification - 1) {
            this.__hideView(this.children.findByIndex(0));
        }
        view.hideTimeout = setTimeout(() => this.__hideView(view), view.model.get('time'));
    },

    __hideView(view) {
        view.$el.fadeOut(300, () => this.collection.remove(view.model));
    }
});
