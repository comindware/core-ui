import 'lib';
import { helpers } from 'utils';
import VirtualCollection from '../../../../../collections/VirtualCollection';
import HighlightableBehavior from '../../../../../collections/behaviors/HighlightableBehavior';

export default VirtualCollection.extend({
    initialize() {
        helpers.applyBehavior(this, HighlightableBehavior);
    }
});
