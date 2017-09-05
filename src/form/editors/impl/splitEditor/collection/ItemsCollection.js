/* global _, define */

import ItemModel from '../model/ItemModel';


export default Core.collections.VirtualCollection.extend({
    constructor() {
        Core.collections.VirtualCollection.prototype.constructor.apply(this, arguments);
        _.extend(this, new Core.collections.behaviors.HighlightableBehavior());
    },

    model: ItemModel
});
