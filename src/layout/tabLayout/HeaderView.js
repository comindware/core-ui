// @flow
import { helpers } from 'utils';
import HeaderView from './HeaderItemView';

const defaultOptions = {
    headerClass: ''
};

export default Marionette.CollectionView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'collection');
        Object.assign(options, defaultOptions);
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
