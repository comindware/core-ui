import ListSearchCanvasView from 'demoPage/views/ListSearchCanvasView';

// Most of this steps came from 'Basic Usage' example.
// New steps required for search & highlight marked with 'NEW'

export default function() {
    // 2. Create VirtualCollection that use this model (and do other stuff maybe)
    const ListItemCollection = core.collections.VirtualCollection();

    // 3. Get some data (inline or by collection.fetch)
    const collection = new ListItemCollection(undefined, { isSliding: true });
    collection.reset(
        _.times(1000, i => ({
            id: i + 1,
            title: `My Task ${i + 1}`
        }))
    );

    // 4. Create child view that display list rows.
    // - you MUST implement ListItemViewBehavior
    // - [NEW] you MUST implement onHighlighted/onUnhighlighted methods to support text highlighting while searching
    const ListView = Marionette.View.extend({
        template: Handlebars.compile('<div class="dd-list__i"><span class="js-title">{{title}}</span></div>'),

        ui: {
            title: '.js-title'
        },

        behaviors: [core.list.views.behaviors.ListItemViewBehavior],

        // It's your responsibility to visualize text highlight
        onHighlighted(fragment) {
            const text = core.utils.htmlHelpers.highlightText(this.model.get('title'), fragment);
            this.ui.title.html(text);
        },
        onUnhighlighted() {
            this.ui.title.text(this.model.get('title'));
        }
    });

    // 5. [NEW] Create searchbar view (or whatever you want to change filter function) and implement search
    const searchBarView = new core.views.SearchBarView();
    searchBarView.on('search', text => {
        if (!text) {
            collection.filter(null);
            collection.unhighlight();
        } else {
            text = text.toLowerCase();
            collection.unhighlight();
            collection.filter(model => Boolean((model.get('title') || '').toLowerCase().indexOf(text) !== -1));
            collection.highlight(text);
        }
    });

    // 6. At last, create list view bundle (ListView and ScrollbarView)
    const listView = core.list.factory.createDefaultList({
        collection, // Take a note that in simple scenario you can pass in
        // a regular Backbone.Collection or even plain javascript array
        listViewOptions: {
            childView: ListView,
            childHeight: 34
        }
    });

    // 7. Show created views in corresponding regions
    return new ListSearchCanvasView({
        search: searchBarView,
        content: listView
    });
}
