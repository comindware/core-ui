import ToastNotificationView from './ToastNotificationView';

const maxNotification = 5;

export default Marionette.CollectionView.extend({
    className: 'dev-notification-container',

    childView: ToastNotificationView,

    onAddChild(view, child) {
        if (this.collection.length > maxNotification) {
            this.collection.remove(this.children.findByIndex(0).model);
        } else if (this.collection.length > maxNotification - 1) {
            this.children.findByIndex(0).hideView();
        }
        child.hideTimeout = setTimeout(() => child.hideView(), child.model.get('time'));
    }
});
