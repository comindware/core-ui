import ValueOptionModel from '../models/ValueOptionModel';

export default Backbone.Collection.extend({
    model: ValueOptionModel,

    initialize(models) {
        Backbone.Select.One.applyTo(this, models);
    }
});
