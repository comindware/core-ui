import core from 'coreApi';
import 'jasmine-jquery';

describe('Editors', () => {
    describe('CodeEditorView', () => {
        it('should initialize', function () {
            const view = new core.components.Toolbar({
                allItemsCollection: new Backbone.Collection([
                    {
                        iconClass: 'plus',
                        id: 'create',
                        name: 'Create',
                        type: 'Action',
                        severity: 'Normal',
                        resultType: 'CustomClientAction',
                        context: 'Void'
                    },
                    {
                        iconType: 'Undefined',
                        id: 'themePicker',
                        name: 'name',
                        severity: 'None',
                        defaultTheme: true,
                        type: 'Popup',
                        options: {
                            collection: new Backbone.Collection(),
                            diagramId: '1',
                            solutionId: '2',
                            buttonView: Marionette.View.extend({ template: _.noop, }),
                            panelView: Marionette.View.extend({ template: _.noop, })
                        }
                    },
                    {
                        iconClass: 'plus',
                        id: 'update',
                        name: 'Update',
                        type: 'Action',
                        severity: 'Normal',
                        resultType: 'CustomClientAction',
                        context: 'Void'
                    },
                    {
                        type: 'Splitter'
                    },
                    {
                        iconClass: 'plus',
                        id: 'delete',
                        name: 'Delete',
                        type: 'Action',
                        severity: 'Normal',
                        resultType: 'CustomClientAction',
                        context: 'Void'
                    },
                    {
                        iconType: 'Undefined',
                        type: 'Checkbox',
                        isShowAliases: false,
                        id: 'setDef',
                        name: 'Check the checkbox',
                        severity: 'None',
                        defaultTheme: true
                    }
                ])
            });

            window.app.getView().getRegion('contentRegion').show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
