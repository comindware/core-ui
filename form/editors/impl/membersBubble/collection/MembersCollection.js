/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.12.2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _ */

define(['module/core', '../models/MemberModel'],
    function (core, MemberModel) {
        'use strict';

        return core.collections.VirtualCollection.extend({
            initialize: function () {
                _.extend(this, new core.collections.behaviors.HighlightableBehavior());
            },

            model: MemberModel
        });
    });
