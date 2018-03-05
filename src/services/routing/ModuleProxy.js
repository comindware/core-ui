export default Marionette.Object.extend({
    initialize(options) {
        Object.values(options.config.routes).forEach(callbackName => {
            // eslint-disable-next-line func-names
            this[callbackName] = function() {
                this.trigger('module:loaded', callbackName, Array.from(arguments), this.options.config, this.options.config.module);
            };
        });
    }
});
