/**
 * Developer: Grigory Kuznetsov
 * Date: 18.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
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
