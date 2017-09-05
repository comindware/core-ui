/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import 'lib';
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
