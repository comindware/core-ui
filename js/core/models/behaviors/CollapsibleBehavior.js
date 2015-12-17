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

define([ 'core/libApi' ],
    function () {
        'use strict';

        var CollapsibleBehavior = function (model) {
        };

        _.extend(CollapsibleBehavior.prototype, {
            collapse: function (internal)
            {
                if (this.collapsed) {
                    return;
                }

                this.collapsed = true;
                this.trigger("collapsed", this);
                this.trigger("toggle:collapse", this);

                if (!internal && this.collection && this.collection.collapse) {
                    this.collection.collapse(this);
                }
            },

            expand: function (internal)
            {
                if (!this.collapsed) {
                    return;
                }

                this.collapsed = false;
                this.trigger("expanded", this);
                this.trigger("toggle:collapse", this);
                if (!internal && this.collection && this.collection.expand) {
                    this.collection.expand(this);
                }
            },

            toggleCollapsed: function ()
            {
                if (this.collapsed) {
                    this.expand();
                } else {
                    this.collapse();
                }
            }
        });

        return CollapsibleBehavior;
    });
