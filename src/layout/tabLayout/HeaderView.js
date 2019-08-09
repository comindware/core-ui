// @flow
import { helpers } from 'utils';
import HeaderItemView from './HeaderItemView';

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

    childView: HeaderItemView,

    childViewEvents: {
        select(model) {
            this.trigger('select', model);
        }
    }
});
