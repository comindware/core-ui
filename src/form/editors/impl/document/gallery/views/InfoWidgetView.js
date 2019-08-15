import template from '../templates/infoWidget.html';

export default Marionette.View.extend({
    className: 'gallery-info-widget',

    template: Handlebars.compile(template),

    templateContext() {
        return this.model.get('infoWidget');
    },

    ui: {
        icon: '.js-info-widget-icon'
    },

    modelEvents: {
        change: 'render'
    },

    onRender() {
        const infoWidget = this.model.get('infoWidget');
        if (infoWidget && infoWidget.picUrl) {
            this.ui.icon.css('background-image', `url(${infoWidget.picUrl})`);
        }
    }
});
