import template from 'text-loader!../templates/listCanvas.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        contentRegion: '.js-content-region'
    },

    className: 'demo-list-canvas__view',

    onRender() {
        this.showChildView('contentRegion', this.options.content);
    }
});
