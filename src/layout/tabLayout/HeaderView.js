// @flow
import { helpers } from 'utils';
import HeaderView from './HeaderItemView';

export default Marionette.CollectionView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'collection');
    },

    tagName: 'ul',

    className() {
        return `layout__tab-layout__header-view ${this.getOption('headerClass')}`;
    },

    childView: HeaderView,

    childViewEvents: {
        select(model) {
            this.trigger('select', model);
        }
    }
});
