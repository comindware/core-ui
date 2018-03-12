export default {
    getFilterViewByType() {
        return Marionette.ItemView.extend({
            template: Handlebars.compile('<div class="innerDiv">PopoutView</div>'),
            className: 'native-filter-popout'
        });
    }
};
