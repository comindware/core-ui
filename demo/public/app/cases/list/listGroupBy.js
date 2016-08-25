define([
    'comindware/core', 'demoPage/views/ListCanvasView'
], function (core, ListCanvasView) {
    'use strict';

    return function () {
        // Most of this steps came from 'Basic Usage' example.
        // New steps required for group-by feature marked with 'NEW'

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

        // 3. Create Backbone.Model that implement ListGroupBehavior. It's gonna be your group model
        var ListGroupItemModel = Backbone.Model.extend({
            initialize: function () {
                core.utils.helpers.applyBehavior(this, core.list.models.behaviors.ListGroupBehavior);
            }
        });

        // 4. Get some data (inline or by collection.fetch)
        var collection = new ListItemCollection();
        collection.reset(_.times(1000, function (i) {
            return {
                id: i + 1,
                title: 'My Task ' + (i + 1)
            };
        }));

        // 4. [NEW] Group the collection
        collection.group([
            {
                // iterator - the function that splits the collection into groups
                iterator: function (model) {
                    return model.id % 100;
                },
                // modelFactory - factory function that create grouping model, a virtual model that presents group in VirtualCollection
                modelFactory: function (model) {
                    return new ListGroupItemModel({
                        displayText: 'Group ' + model.id % 100
                    });
                }
            }
        ]);

        // 5. Create child view that display list rows.
        // - you MUST implement ListItemViewBehavior
        var ListItemView = Marionette.ItemView.extend({
            template: Handlebars.compile('<div class="dd-list__i"><span class="js-title">{{title}}</span></div>'),

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: core.list.views.behaviors.ListItemViewBehavior
                }
            }
        });

        // 5. Create child view that display grouping rows.
        var ListGroupItemView = Marionette.ItemView.extend({
            template: Handlebars.compile('<div class="dd-list__i dd-list__i_group"> {{displayText}}</div>'),
            className: 'mselect__group',

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: core.list.views.behaviors.ListItemViewBehavior
                }
            }
        });

        // 6. At last, create list view bundle (ListView and ScrollbarView)
        var bundle = core.list.factory.createDefaultList({
            collection: collection, // Take a note that in simple scenario you can pass in
                                    // a regular Backbone.Collection or even plain javascript array
            listViewOptions: {
                childViewSelector: function(model) {
                    // We use different views based on is it grouping row or a regular one
                    if (model instanceof ListItemModel) {
                        return ListItemView;
                    } else {
                        return ListGroupItemView;
                    }
                },
                childHeight: 34
            }
        });

        // 7. Show created views in corresponding regions
        return new ListCanvasView({
            content: bundle.listView,
            scrollbar: bundle.scrollbarView
        });
    };
});
