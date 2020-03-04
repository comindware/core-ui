/*eslint-ignore*/

import core from 'coreApi';
import 'jasmine-jquery';
import FocusTests from './FocusTests';

const context = {
    'oa.1': [
        {
            instanceTypeId: 'cmw.instanceProperty',
            type: 'Instance',
            format: 'Undefined',
            name: 'ID',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'id'
        },
        {
            type: 'Account',
            format: 'Undefined',
            name: 'Last Modifier',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'lastModifier'
        },
        {
            type: 'DateTime',
            format: 'Undefined',
            name: 'Last Modified',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'lastWriteDate'
        },
        {
            instanceTypeId: 'oa.1',
            type: 'Collection',
            format: 'Undefined',
            name: 'coll',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'op.2'
        },
        {
            instanceTypeId: 'oa.1',
            type: 'Instance',
            format: 'Undefined',
            name: 'refToCol',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'op.1'
        },
        {
            type: 'DateTime',
            format: 'Undefined',
            name: 'Creation Date',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'creationDate'
        },
        {
            type: 'Boolean',
            format: 'Undefined',
            name: 'In archive',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'isDisabled'
        },
        {
            type: 'Account',
            format: 'Undefined',
            name: 'Creator',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'creator'
        },
        {
            type: 'String',
            format: 'Undefined',
            name: 'werterwtert',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'op.10'
        },
        {
            instanceTypeId: 'oa.1',
            type: 'Instance',
            format: 'Undefined',
            name: 'sdfsf',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'op.13'
        },
        {
            instanceTypeId: 'oa.1',
            type: 'Collection',
            format: 'Undefined',
            name: 'coll',
            displayAttribute: false,
            isBuiltIn: false,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'op.14'
        },
        {
            type: 'String',
            format: 'Undefined',
            name: 'Process ID',
            displayAttribute: false,
            isBuiltIn: true,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'engine:id'
        },
        {
            type: 'String',
            format: 'Undefined',
            name: 'Record ID',
            displayAttribute: false,
            isBuiltIn: true,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'id'
        },
        {
            type: 'Account',
            format: 'Undefined',
            name: 'Process Initiator',
            displayAttribute: false,
            isBuiltIn: true,
            calculated: false,
            isSystem: false,
            isDisabled: false,
            id: 'creator'
        }
    ]
};

describe('Editors', () => {
    describe('Complex editor', () => {
        // TODO: Complex editor should have own focus test
        // FocusTests.runFocusTests({
        //     initialize: () =>
        //         new core.form.editors.ComplexEditor({
        //             title: 'EE',
        //             collection: new Backbone.Collection(),
        //             required: true,
        //             showValue: true,
        //             showExpression: true,
        //             showScript: true,
        //             showContext: true,
        //             context,
        //             recordTypeId: 'oa.1',
        //             propertyTypes: [],
        //             usePropertyTypes: false,
        //             popoutFlow: 'right',
        //             autocommit: true,
        //             ontologyService: null
        //         })
        // });
        it('should initialize', () => {
            const view = new core.form.editors.ComplexEditor({
                title: 'EE',
                collection: new Backbone.Collection(),
                required: true,
                showValue: true,
                showExpression: true,
                showScript: true,
                showContext: true,
                context,
                recordTypeId: 'oa.1',
                propertyTypes: [],
                usePropertyTypes: false,
                popoutFlow: 'right',
                autocommit: true,
                ontologyService: null
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(true).toBe(true);
        });

        it('should correctly apply visibility options', () => {
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(
                    new core.form.editors.ComplexEditor({
                        collection: new Backbone.Collection(),
                        showValue: true,
                        showExpression: true,
                        showScript: true,
                        showContext: true,
                        showTemplate: true,
                        context,
                        recordTypeId: 'oa.1',
                        propertyTypes: [],
                        usePropertyTypes: false,
                        ontologyService: null
                    })
                );

            expect(document.getElementsByClassName('js-complex-value-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-context-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-script-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-expression-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-template-container').length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(
                    new core.form.editors.ComplexEditor({
                        collection: new Backbone.Collection(),
                        showValue: false,
                        showExpression: true,
                        showScript: true,
                        showContext: true,
                        showTemplate: true,
                        context,
                        recordTypeId: 'oa.1',
                        propertyTypes: [],
                        usePropertyTypes: false,
                        ontologyService: null
                    })
                );

            expect(document.getElementsByClassName('js-complex-value-container').length).toEqual(0);
            expect(document.getElementsByClassName('js-complex-context-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-script-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-expression-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-template-container').length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(
                    new core.form.editors.ComplexEditor({
                        collection: new Backbone.Collection(),
                        showValue: true,
                        showExpression: false,
                        showScript: true,
                        showContext: true,
                        showTemplate: true,
                        context,
                        recordTypeId: 'oa.1',
                        propertyTypes: [],
                        usePropertyTypes: false,
                        ontologyService: null
                    })
                );

            expect(document.getElementsByClassName('js-complex-value-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-context-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-script-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-expression-container').length).toEqual(0);
            expect(document.getElementsByClassName('js-complex-template-container').length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(
                    new core.form.editors.ComplexEditor({
                        collection: new Backbone.Collection(),
                        showValue: true,
                        showExpression: true,
                        showScript: false,
                        showContext: true,
                        showTemplate: true,
                        context,
                        recordTypeId: 'oa.1',
                        propertyTypes: [],
                        usePropertyTypes: false,
                        ontologyService: null
                    })
                );

            expect(document.getElementsByClassName('js-complex-value-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-context-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-script-container').length).toEqual(0);
            expect(document.getElementsByClassName('js-complex-expression-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-template-container').length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(
                    new core.form.editors.ComplexEditor({
                        collection: new Backbone.Collection(),
                        showValue: true,
                        showExpression: true,
                        showScript: true,
                        showContext: false,
                        showTemplate: true,
                        context,
                        recordTypeId: 'oa.1',
                        propertyTypes: [],
                        usePropertyTypes: false,
                        ontologyService: null
                    })
                );

            expect(document.getElementsByClassName('js-complex-value-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-context-container').length).toEqual(0);
            expect(document.getElementsByClassName('js-complex-script-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-expression-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-template-container').length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(
                    new core.form.editors.ComplexEditor({
                        collection: new Backbone.Collection(),
                        showValue: true,
                        showExpression: true,
                        showScript: true,
                        showContext: true,
                        showTemplate: false,
                        context,
                        recordTypeId: 'oa.1',
                        propertyTypes: [],
                        usePropertyTypes: false,
                        ontologyService: null
                    })
                );

            expect(document.getElementsByClassName('js-complex-value-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-context-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-script-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-expression-container').length).toEqual(1);
            expect(document.getElementsByClassName('js-complex-template-container').length).toEqual(0);
        });
    });
});
