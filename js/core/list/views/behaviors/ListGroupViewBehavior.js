/**
 * Developer: Stepan Burguchev
 * Date: 8/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../libApi';

/*
    This behavior makes grouping items collapsible. To switch between the collapsed/expanded states there is a templateHelpers property 'collapsed' passed to the template model.
    
    Options:
        collapseButton - jquery selector string that points to the collapse/expand button. If omitted, whole view is considered the button and toggle the collapse state on click.
*/

let ListGroupViewBehavior = Marionette.Behavior.extend({
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

export default ListGroupViewBehavior;
