/**
 * Developer: Stepan Burguchev
 * Date: 8/14/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([ 'module/lib', './DemoDropdownItemView' ], function (lib, DemoDropdownItemView) {
    'use strict';

    return Marionette.CollectionView.extend({
        childView: DemoDropdownItemView,

        className: 'dropdown-list',

        onRender: function () {
            this.$el.css({
                'max-height': '200px',
                'overflow-y': 'auto'
            });
        }
    });
});
