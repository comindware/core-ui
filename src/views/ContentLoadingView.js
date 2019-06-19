import template from './templates/contentLoading.html';

const defaultOptions = () => ({
    message: Localizer.get('CORE.COMMON.LOADING')
});

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    templateContext() {
        _.defaults(this.options, defaultOptions());
        return this.options;
    },

    className: 'loader',

    setLoadingMessage(message = defaultOptions().message) {
        if (this.options.message === message) {
            return;
        }
        this.options.message = message;
        this.render();
    }
});
