/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';

/**
 * @name ListPanelView
 * @memberof module:core.dropdown.views
 * @class Базовая панель для отображения списка элементов. Может использоваться в panelView опции.
 * @constructor
 * @extends Marionette.CollectionView
 * @param {Object} options Объект опций.
 * */

export default Marionette.CollectionView.extend({
    initialize: function (options) {
    },

    tagName: 'ul'
});
