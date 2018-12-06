export default Backbone.Model.extend({
    defaults: {
        isChecked: false
    },

    toggleChecked() {
        this.set('isChecked', !this.get('isChecked'));
    }
});
