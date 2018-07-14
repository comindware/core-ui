export default function() {
    const customView = Marionette.View;

    const systemView = Marionette.CollectionView.extend({
        className: 'dev-canvas-wrp js-system-container',

        template: Handlebars.compile(`<div class="ld-canvas-wrp__info">
        <span class="js-toggle ld-group-toggle">
            <svg viewBox="0 0 12 12"><polygon class="d-svg-icons d-svg-icons_arrow" points="8,2 4.5,5.5 1,2 0,2 0,3 4,7 5,7 9,3 9,2 "/></svg>
        </span>
        <span class="ld-canvas-wrp-info js-name">{{name}}</span>
    </div>
    <div class="js-container"></div>`),

        onRender() {
            this.listenTo(this.model.parent, 'change', this.__updateView);
            this.__updateView(this.model.parent);
        },

        __updateView(model) {
            this.ui.name.text(model.get('name'));
        },

        __toggleCollapse() {
            this.model.set('collapsed', !this.model.get('collapsed'));
        }
    });

    const components = {
        Splitter: {
            view: customView,
            model: Backbone.Model
        },
        SystemView: systemView
    };
    Object.keys(core.form.editors).forEach(key => {
        components[key] = {
            view: core.form.editors[key],
            model: Backbone.Model
        };
    });

    components.VerticalLayout = {
        model: Backbone.Model.extend({
            defaults: {
                childrenAttribute: 'rows',
                rows: new Backbone.Collection(),
                componentType: 'container',
                fieldType: 'VerticalLayout',
                type: 'VerticalLayout',
                canBeNested: true
            },

            parse(data) {
                if (Array.isArray(data.rows)) {
                    data.rows = new Backbone.Collection(data.rows);
                }
                return data;
            }
        })
    };

    return new core.components.LayoutDesigner.Controller({
        editorModel: new Backbone.Model(),
        detachedToolbar: true,
        palette: {
            toolbar: {},
            collection: new Backbone.Collection(Object.keys(core.form.editors).map(key => ({ fieldType: key, name: key }))),
            elementsCollection: new Backbone.Collection(),
            size: 'small'
        },
        canvas: {
            collection: new Backbone.Collection(),
            components,
            dropZoneType: 'fixed',
            focusOnShow: true
        },
        properties: {
            components: {
                SempleView: Marionette.View,
                SystemView: class {
                    constructor() {
                        return new Core.layout.Form({
                            model: new Backbone.Model(),
                            schema: [
                                {
                                    type: 'v-container',
                                    items: []
                                }
                            ]
                        });
                    }
                },
                size: 'large'
            }
        },
        toolbar: {
            excludeActions: ['clone', 'delete']
        }
    }).view;
}
