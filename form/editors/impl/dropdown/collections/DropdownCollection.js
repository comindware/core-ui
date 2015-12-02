/**
 * Developer: Grigory Kuznetsov
 * Date: 22.09.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
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
