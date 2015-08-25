/**
 * Developer: Grigory Kuznetsov
 * Date: 18.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([],
    function () {
        'use strict';

        return {
            getFilterViewByType: function (type) {
                var PanelView =  Marionette.ItemView.extend({
                    template: Handlebars.compile('<div class="innerDiv">PopoutView</div>'),
                    className: 'dev-filter-popout'
                });

                return PanelView;
            }
        };

    }
);
