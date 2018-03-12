import template from 'text-loader!../templates/listCanvas.html';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        contentRegion: '.js-content-region'
    },

    className: 'demo-list-canvas__view',

    onShow() {
        this.contentRegion.show(this.options.content);
        // this.scrollbarRegion.show(this.options.scrollbar);
    }
});
