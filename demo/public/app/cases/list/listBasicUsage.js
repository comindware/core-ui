define([
    'comindware/core', 'demoPage/views/ListCanvasView'
], function (core, ListCanvasView) {
    'use strict';

    return function () {
        // There are a lot of steps but it's not that complicated as it seems:

        // 1. Create Backbone.Model that implement ListItemBehavior
        var ListItemModel = Backbone.Model.extend({
            initialize: function () {
                core.utils.helpers.applyBehavior(this, core.list.models.behaviors.ListItemBehavior);
            }
        });

        // 2. Create VirtualCollection that use this model (and do other stuff maybe)
        var ListItemCollection = core.collections.VirtualCollection.extend({
            model: ListItemModel
        });

        // 3. Get some data (inline or by collection.fetch)
        var collection = new ListItemCollection();
        collection.reset(_.times(1000, function (i) {
            return {
                id: i + 1,
                title: 'My Task ' + (i + 1)
            };
        }));

        // 4. Create child view that display list rows.
        // - you MUST implement ListItemViewBehavior
        // - you CAN implement onHighlighted/onUnhighlighted methods to support text highlighting while searching
        var ListItemView = Marionette.ItemView.extend({
            template: Handlebars.compile('<div class="js-menu-select-item menu-bselect__item">{{title}}</div>'),

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: core.list.views.behaviors.ListItemViewBehavior
                }
            }
        });

        // 5. At last, create list view bundle (ListView and ScrollbarView)
        var bundle = core.list.factory.createDefaultList({
            collection: collection, // Take a note that in simple scenario you can pass in
                                    // a regular Backbone.Collection or even plain javascript array
            listViewOptions: {
                childView: ListItemView,
                childHeight: 34
            }
        });

        // 6. Show created views in corresponding regions
        return new ListCanvasView({
            content: bundle.listView,
            scrollbar: bundle.scrollbarView
        });
    };
});
