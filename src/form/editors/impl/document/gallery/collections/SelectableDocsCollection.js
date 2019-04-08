import SelectableBehavior from 'models/behaviors/SelectableBehavior';

export default Backbone.Collection.extend({
    initialize() {
        _.extend(this, new SelectableBehavior.SingleSelect(this));
        this.selectedModelClone = new Backbone.Model();
        this.listenTo(this, 'select:one', model => {
            this.selectedModelClone.clear({ silent: true });
            this.selectedModelClone.set(model.toJSON());
        });
    }
});
