/**
 * Developer: Stepan Burguchev
 * Date: 1/29/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _ */

define(['../models/MemberModel', 'module/core'],
    function (MemberModel, core) {
        'use strict';

        return core.collections.VirtualCollection.extend({
            initialize: function () {
                _.extend(this, new core.collections.behaviors.HighlightableBehavior());
            },

            model: MemberModel
        });
    });
