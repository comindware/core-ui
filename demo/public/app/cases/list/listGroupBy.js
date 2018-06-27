

import ListCanvasView from 'demoPage/views/ListCanvasView';

export default function() {
    // Most of this steps came from 'Basic Usage' example.
    // New steps required for group-by feature marked with 'NEW'

    // 1. Create Backbone.Model that implement ListItemBehavior
    const ListItemModel = Backbone.Model.extend({
        initialize() {
            core.utils.helpers.applyBehavior(this, core.list.models.behaviors.ListItemBehavior);
        }
    });

    // 2. Create VirtualCollection that use this model (and do other stuff maybe)
    const ListItemCollection = core.collections.VirtualCollection.extend({
        model: ListItemModel
    });

    // 3. Create Backbone.Model that implement ListGroupBehavior. It's gonna be your group model
    const ListGroupItemModel = Backbone.Model.extend({
        initialize() {
            core.utils.helpers.applyBehavior(this, core.list.models.behaviors.ListGroupBehavior);
        }
    });

    // 4. Get some data (inline or by collection.fetch)
    const collection = new ListItemCollection(undefined, { isSliding: true });
    collection.reset(_.times(1000, i => ({
        id: i + 1,
        title: `My Task ${i + 1}`
    })));

    // 4. [NEW] Group the collection
    collection.group([
        {
            // iterator - the function that splits the collection into groups
            iterator(model) {
                return model.id % 100;
            },
            // modelFactory - factory function that create grouping model, a virtual model that presents group in VirtualCollection
            modelFactory(model) {
                return new ListGroupItemModel({
                    displayText: `Group ${model.id % 100}`
                });
            }
        }
    ]);

    // 5. Create child view that display list rows.
    // - you MUST implement ListItemViewBehavior
    const ListView = Marionette.View.extend({
        template: Handlebars.compile('<div class="dd-list__i"><span class="js-title">{{title}}</span></div>'),

        behaviors: [core.list.views.behaviors.ListItemViewBehavior]
    });

    // 5. Create child view that display grouping rows.
    const ListGroupView = Marionette.View.extend({
        template: Handlebars.compile('<div class="dd-list__i dd-list__i_group"> {{displayText}}</div>'),
        className: 'mselect__group',

        behaviors: [ core.list.views.behaviors.ListItemViewBehavior]
    });

    // 6. At last, create list view bundle (ListView and ScrollbarView)
    const listView = core.list.factory.createDefaultList({
        collection, // Take a note that in simple scenario you can pass in
        // a regular Backbone.Collection or even plain javascript array
        listViewOptions: {
            childViewSelector(model) {
                // We use different views based on is it grouping row or a regular one
                if (model instanceof ListItemModel) {
                    return ListView;
                }
                return ListGroupView;
            },
            childHeight: 34
        }
    });

    // 7. Show created views in corresponding regions
    return new ListCanvasView({
        content: listView
    });
}
