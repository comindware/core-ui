import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    /*
    describe('Layout designer', () => {
        it('should set text', () => {
            const components = {
                Splitter: {
                    view: Marionette.View,
                    model: Backbone.Model
                },
                SystemView: Marionette.View
            };
            Object.keys(core.form.editors).forEach(key => {
                components[key] = {
                    view: core.form.editors[key],
                    model: Backbone.Model
                };
            });

            const view = new core.components.LayoutDesigner.Controller({
                editorModel: new Backbone.Model(),
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
                        SystemView: Marionette.View
                    },
                    size: 'large'
                },
                toolbar: {
                    excludeActions: ['clone', 'delete']
                }
            }).view;

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(true).toEqual(true);
        });
    });
    */
});
