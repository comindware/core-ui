const activeListeners = [];

export default {
    addEventListener(controller) {
        const channel = activeListeners.find(model => model.id === controller.id);

        if (channel) {
            channel.controllers.push(controller);
        }
    },

    removeEventListener(controller) {
        const channel = activeListeners.find(model => model.id === controller.id);

        if (channel) {
            channel.controllers.remove(controller);
        }
    },

    dispatchEvent(controller, eventName, options) {
        const channel = activeListeners.find(model => model.id === controller.id);

        if (channel) {
            channel.controllers.forEach(listener => {
                if (listener.id !== controller.id) {
                    listener.trigger('eventName', options);
                }
            });
        }
    }
};
