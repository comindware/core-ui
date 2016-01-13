define([
    'comindware/core', 'demoPage/views/ListSearchCanvasView'
], function (core, ListSearchCanvasView) {
    'use strict';

    return function () {
        // Most of this steps came from 'Basic Usage' example.
        // New steps required for search & highlight marked with 'NEW'

        // 1. Create Backbone.Model that implement ListItemBehavior
        var ListItemModel = Backbone.Model.extend({
            initialize: function () {
                core.utils.helpers.applyBehavior(this, core.list.models.behaviors.ListItemBehavior);
            }
        });

        // 2. Create VirtualCollection that use this model (and do other stuff maybe)
        // [NEW] apply HighlightableBehavior on it
        var ListItemCollection = core.collections.VirtualCollection.extend({
            initialize: function () {
                core.utils.helpers.applyBehavior(this, core.collections.behaviors.HighlightableBehavior);
            },
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
        // - [NEW] you MUST implement onHighlighted/onUnhighlighted methods to support text highlighting while searching
        var ListItemView = Marionette.ItemView.extend({
            template: Handlebars.compile('<div class="js-menu-select-item menu-bselect__item"><span class="js-title">{{title}}</span></div>'),

            ui: {
                title: '.js-title'
            },

            behaviors: {
                ListItemViewBehavior: {
                    behaviorClass: core.list.views.behaviors.ListItemViewBehavior
                }
            },

            // It's your responsibility to visualize text highlight
            onHighlighted: function (fragment) {
                var text = core.utils.htmlHelpers.highlightText(this.model.get('title'), fragment);
                this.ui.title.html(text);
            },
            onUnhighlighted: function () {
                this.ui.title.text(this.model.get('title'));
            }
        });

        // 5. [NEW] Create searchbar view (or whatever you want to change filter function) and implement search
        var searchBarView = new core.views.SearchBarView();
        searchBarView.on('search', function (text) {
            if (!text) {
                collection.filter(null);
                collection.unhighlight();
            } else {
                text = text.toLowerCase();
                collection.unhighlight();
                collection.filter(function (model) {
                    return Boolean((model.get('title') || '').toLowerCase().indexOf(text) !== -1);
                });
                collection.highlight(text);
            }
        });

        // 6. At last, create list view bundle (ListView and ScrollbarView)
        var bundle = core.list.factory.createDefaultList({
            collection: collection, // Take a note that in simple scenario you can pass in
                                    // a regular Backbone.Collection or even plain javascript array
            listViewOptions: {
                childView: ListItemView,
                childHeight: 34
            }
        });

        // 7. Show created views in corresponding regions
        return new ListSearchCanvasView({
            search: searchBarView,
            content: bundle.listView,
            scrollbar: bundle.scrollbarView
        });
    };
});
