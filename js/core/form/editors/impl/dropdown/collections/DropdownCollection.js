/**
 * Developer: Grigory Kuznetsov
 * Date: 22.09.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['core/utils/utilsApi',
        'core/collections/VirtualCollection',
        'core/collections/behaviors/HighlightableBehavior'],
    function (utils, VirtualCollection, HighlightableBehavior) {
        'use strict';

        return VirtualCollection.extend({
            initialize: function () {
                utils.helpers.applyBehavior(this, HighlightableBehavior);
            }
        });
    });
