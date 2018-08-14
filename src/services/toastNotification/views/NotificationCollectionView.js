import ToastNotificationView from './ToastNotificationView';

const maxNotification = 5;

export default Marionette.CollectionView.extend({
    className: 'notification-container',

    childView: ToastNotificationView,

    onBeforeAddChild(_, child) {
        if (this.collection.length > maxNotification) {
            this.collection.remove(this.children.findByIndex(0).model);
        } else if (this.collection.length > maxNotification - 1) {
            this.children.findByIndex(0).hideView();
        }
        const sameNotification = this.children.find(childView => childView.model.get('text') === child.model.get('text'));
        if (sameNotification) {
            this.collection.remove(sameNotification.model);
        }
        child.hideTimeout = setTimeout(() => child.hideView(), child.model.get('time'));
    }
});
