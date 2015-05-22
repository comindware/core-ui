/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, _, Marionette */

/*
    This behavior makes grouping items collapsible. To switch between the collapsed/expanded states there is a templateHelpers property 'collapsed' passed to the template model.
    
    Options:
        collapseButton - jquery selector string that points to the collapse/expand button. If omitted, whole view is considered the button and toggle the collapse state on click.
*/
define(['module/utils'],
    function () {
        'use strict';
        var ListGroupViewBehavior = Marionette.Behavior.extend({
            initialize: function (options, view) {
                // mixing behavior's templateHelpers even if it's already defined in the view
                if (view.templateHelpers) {
                    var self = this;
                    var viewTemplateHelpers = view.templateHelpers.bind(view);
                    view.templateHelpers = function () {
                        return _.extend(self.templateHelpers(), viewTemplateHelpers());
                    };
                }
            },

            events: {
                'click': '__handleCollapseExpand'
            },

            __handleCollapseExpand: function (e)
            {
                var collapseButton = this.getOption('collapseButton');
                var collapseButtonEl;
                if (!collapseButton || ((collapseButtonEl = this.$el.find(collapseButton)[0]) !== undefined && e.target === collapseButtonEl)) {
                    this.view.model.toggleCollapsed();
                }
            },

            templateHelpers: function () {
                return {
                    collapsed: this.view.model.collapsed === true
                };
            }
        });

        var behaviors = window.ClassLoader.createNS("shared.list.views.behaviors");
        behaviors.ListGroupViewBehavior = ListGroupViewBehavior;

        return ListGroupViewBehavior;
    });
