/**
 * Developer: Stepan Burguchev
 * Date: 9/16/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import template from '../templates/fadingPanel.hbs';

export default Marionette.ItemView.extend({
    initialize: function () {
    },

    template: template,

    className: 'fadingPanel',

    events: {
        'click': '__onClick'
    },

    fadeIn: function (options)
    {
        this.activeOptions = options || null;
        this.$el.addClass('fadingPanel_open');
    },

    fadeOut: function ()
    {
        this.activeOptions = null;
        this.$el.removeClass('fadingPanel_open');
    },

    __onClick: function () {
        this.trigger('click', this, this.activeOptions);
    }
});
