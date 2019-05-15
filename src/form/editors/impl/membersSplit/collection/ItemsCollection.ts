import VirtualCollection from '../../../../../collections/VirtualCollection';

export default VirtualCollection.extend({
    constructor() {
        VirtualCollection.prototype.constructor.apply(this, arguments);
    }
});
