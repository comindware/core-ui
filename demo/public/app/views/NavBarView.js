/**
 * Developer: Stepan Burguchev
 * Date: 6/7/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import NavBarItemView from './NavBarItemView';

export default Marionette.CollectionView.extend({
    className: 'demo-nav',

    childView: NavBarItemView
});
