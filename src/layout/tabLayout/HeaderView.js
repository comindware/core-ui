
import { helpers } from 'utils';
import HeaderItemView from './HeaderItemView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'collection');
    },

    tagName: 'ul',

    className: 'layout__tab-layout__header-view',

    childView: HeaderItemView,

    childEvents: {
        select(view) {
            this.trigger('select', view.model);
        }
    }
});
