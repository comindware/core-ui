import VirtualCollection from '../../../../../collections/VirtualCollection';
import HighlightableBehavior from '../../../../../collections/behaviors/HighlightableBehavior';
import ItemModel from '../model/ItemModel';

export default VirtualCollection.extend({
    constructor() {
        VirtualCollection.prototype.constructor.apply(this, arguments);
        _.extend(this, new HighlightableBehavior());
    },

    model: ItemModel
});
