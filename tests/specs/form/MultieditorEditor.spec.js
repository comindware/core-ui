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
    describe('Multieditor editor', () => {
        FocusTests.runFocusTests({
            initialize: () => new core.form.editors.NewExpressionEditor({
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
            })
        });
        it('should initialize', () => {
            const view = new core.form.editors.NewExpressionEditor({
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
                .show(new core.form.editors.NewExpressionEditor({
                    collection: new Backbone.Collection(),
                    showValue: true,
                    showExpression: true,
                    showScript: true,
                    showContext: true,
                    context,
                    recordTypeId: 'oa.1',
                    propertyTypes: [],
                    usePropertyTypes: false,
                    ontologyService: null
                }));

            expect(document.getElementsByClassName('js-new-expression-value-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-context-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-script-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-expression-container')[0].childNodes.length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(new core.form.editors.NewExpressionEditor({
                    collection: new Backbone.Collection(),
                    showValue: false,
                    showExpression: true,
                    showScript: true,
                    showContext: true,
                    context,
                    recordTypeId: 'oa.1',
                    propertyTypes: [],
                    usePropertyTypes: false,
                    ontologyService: null
                }));

            expect(document.getElementsByClassName('js-new-expression-value-container')[0].childNodes.length).toEqual(0);
            expect(document.getElementsByClassName('js-new-expression-context-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-script-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-expression-container')[0].childNodes.length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(new core.form.editors.NewExpressionEditor({
                    collection: new Backbone.Collection(),
                    showValue: true,
                    showExpression: false,
                    showScript: true,
                    showContext: true,
                    context,
                    recordTypeId: 'oa.1',
                    propertyTypes: [],
                    usePropertyTypes: false,
                    ontologyService: null
                }));

            expect(document.getElementsByClassName('js-new-expression-value-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-context-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-script-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-expression-container')[0].childNodes.length).toEqual(0);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(new core.form.editors.NewExpressionEditor({
                    collection: new Backbone.Collection(),
                    showValue: true,
                    showExpression: true,
                    showScript: false,
                    showContext: true,
                    context,
                    recordTypeId: 'oa.1',
                    propertyTypes: [],
                    usePropertyTypes: false,
                    ontologyService: null
                }));

            expect(document.getElementsByClassName('js-new-expression-value-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-context-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-script-container')[0].childNodes.length).toEqual(0);
            expect(document.getElementsByClassName('js-new-expression-expression-container')[0].childNodes.length).toEqual(1);

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(new core.form.editors.NewExpressionEditor({
                    collection: new Backbone.Collection(),
                    showValue: true,
                    showExpression: true,
                    showScript: true,
                    showContext: false,
                    context,
                    recordTypeId: 'oa.1',
                    propertyTypes: [],
                    usePropertyTypes: false,
                    ontologyService: null
                }));

            expect(document.getElementsByClassName('js-new-expression-value-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-context-container')[0].childNodes.length).toEqual(0);
            expect(document.getElementsByClassName('js-new-expression-script-container')[0].childNodes.length).toEqual(1);
            expect(document.getElementsByClassName('js-new-expression-expression-container')[0].childNodes.length).toEqual(1);
        });
    });
});
