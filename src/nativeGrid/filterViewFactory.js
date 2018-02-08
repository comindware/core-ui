
export default {
    getFilterViewByType() {
        return Marionette.View.extend({
            template: Handlebars.compile('<div class="innerDiv">PopoutView</div>'),
            className: 'native-filter-popout'
        });
    }
};
