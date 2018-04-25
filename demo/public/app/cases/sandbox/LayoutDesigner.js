export default function() {
    return new core.components.LayoutDesigner.Controller({
        editorModel: new Backbone.Model(),
        detachedToolbar: true,
        palette: {
            toolbar: {},
            collection: new Backbone.Collection(),
            elementsCollection: new Backbone.Collection([
                {
                    fieldType: 'Splitter',
                    name: 'SPLITTER'
                }
            ]),
            size: 'small'
        },
        canvas: {
            collection: new Backbone.Collection(),
            components: {
                SempleView: {
                    view: Marionette.View,
                    model: Backbone.Model
                },
                Splitter: {
                    view: Marionette.View,
                    model: Backbone.Model
                },
                SystemView: Marionette.View
            },
            dropZoneType: 'fixed',
            focusOnShow: true
        },
        properties: {
            components: {
                SempleView: Marionette.View,
                SystemView: Marionette.View
            },
            size: 'large'
        },
        toolbar: {
            excludeActions: ['clone', 'delete']
        }
    }).view;
}
