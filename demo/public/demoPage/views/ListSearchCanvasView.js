import template from 'text-loader!../templates/listSearchCanvas.html';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        searchRegion: '.js-search-region',
        contentRegion: '.js-content-region'
    },

    className: 'demo-list-canvas__view_search',

    onShow() {
        this.contentRegion.show(this.options.content);
        this.searchRegion.show(this.options.search);
    }
});
