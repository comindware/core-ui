/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../libApi';
import template from '../templates/menuItem.hbs';

/**
 * @name MenuItemView
 * @memberof module:core.dropdown.views
 * @class Одиночный элемент меню. Используется в связке с MenuPanelView для создания стандартного меню фабричным методом
 * {@link module:core.dropdown.factory createMenu}.
 * @constructor
 * @extends Marionette.ItemView
 * */

export default Marionette.ItemView.extend({
    initialize: function () {
    },

    tagName: 'li',

    className: 'popout-menu__i',

    template: template,

    events: {
        'click': function () {
            this.trigger('execute', this.model);
        }
    }
});
