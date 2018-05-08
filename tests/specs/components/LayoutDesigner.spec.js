import core from 'coreApi';
import 'jasmine-jquery';

const editorModel = Backbone.Model.extend();

describe('Components', () => {
    describe('Layout designer', () => {
        /*
        it('should set text', () => {
          
            const reqres = Backbone.Radio.channel(_.uniqueId());

            const view = new core.components.LayoutDesigner.Controller({
                editorModel: new Backbone.Model(),
                componentReqres: reqres,
                detachedToolbar: true,
                palette: {
                    toolbar: {},
                    collection: new Backbone.Collection(),
                    elementsCollection: new Backbone.Collection([
                        {
                            fieldType: 'Tabs',
                            name: 'Tabs'
                        }
                    ]),
                    size: 'small'
                },
                canvas: {
                    collection: new Backbone.Collection(),
                    components: {
                        SempleView: {
                            view: Marionette.View,
                            model: editorModel
                        },
                        Tabs: {
                            view: Marionette.View,
                            model: editorModel
                        },
                        VerticalLayout: {
                            model: editorModel
                        },
                        SystemView: Marionette.View
                    },
                    dropZoneType: 'fixed',
                    focusOnShow: true
                },
                properties: {
                    components: {
                        SempleView: Marionette.View,
                        Tabs: Marionette.View,
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
        */
    });
});
