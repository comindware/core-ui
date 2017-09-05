
export default Backbone.Model.extend({
    initialize() {
        Backbone.Select.Me.applyTo(this);
    }
});
