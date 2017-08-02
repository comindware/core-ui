/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

/**
 * @name ListPanelView
 * @memberof module:core.dropdown.views
 * @class Primitive view that can be used as a <code>panelView</code> to display a list of elements.
 * @constructor
 * @extends Marionette.CollectionView
 * @param {Object} options Options object.
 * */

export default Marionette.CollectionView.extend({
    initialize() {
    },

    tagName: 'ul'
});
