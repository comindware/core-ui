/**
 * Developer: Stepan Burguchev
 * Date: 7/23/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, _ */

define([ 'module/utils' ],
    function () {
        'use strict';

        var HighlightableBehavior = function (model) {
        };

        _.extend(HighlightableBehavior.prototype, {
            highlight: function (text)
            {
                this.parentCollection.each(function (record) {
                    if (record.highlight) {
                        record.highlight(text);
                    }
                });
            },

            unhighlight: function ()
            {
                this.parentCollection.each(function (record) {
                    if (record.unhighlight) {
                        record.unhighlight();
                    }
                });
            }
        });

        return HighlightableBehavior;
    });
