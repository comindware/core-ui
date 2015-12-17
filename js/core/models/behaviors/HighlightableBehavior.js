/**
 * Developer: Stepan Burguchev
 * Date: 7/23/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Backbone, _ */

define([ 'core/libApi' ],
    function () {
        'use strict';

        var HighlightableBehavior = function (model) {
        };

        _.extend(HighlightableBehavior.prototype, {
            highlight: function (text)
            {
                if (this.highlighted) {
                    return;
                }

                this.highlighted = true;
                this.highlightedFragment = text;
                this.trigger("highlighted", this, {
                    text: text
                });
            },

            unhighlight: function ()
            {
                if (!this.highlighted) {
                    return;
                }

                this.highlighted = false;
                this.highlightedFragment = undefined;
                this.trigger("unhighlighted", this);
            }
        });

        return HighlightableBehavior;
    });
