import ListCanvasView from 'demoPage/views/ListCanvasView';

export default function() {
    // There are a lot of steps but it's not that complicated as it seems:

    // 1. Create Backbone.Model that implement ListItemBehavior
    const data = _.times(10000, i => ({
        id: i + 1,
        title: `My Task ${i + 1}`
    }));

    // 4. Create child view that display list rows.
    // - you MUST implement ListItemViewBehavior
    // - you CAN implement onHighlighted/onUnhighlighted methods to support text highlighting while searching
    const ListView = Marionette.View.extend({
        template: Handlebars.compile('<div class="dd-list__i">{{title}}</div>'),

        behaviors: [Core.list.views.behaviors.ListItemViewBehavior]
    });

    // 5. At last, create list view bundle (ListView and ScrollbarView)
    const listView = new Core.list.GridView({
        collection: data, // Take a note that in simple scenario you can pass in
        // a regular Backbone.Collection or even plain javascript array
        childView: ListView,
        childHeight: 25
    });

    // 6. Show created views in corresponding regions
    return new ListCanvasView({
        content: listView
    });
}
