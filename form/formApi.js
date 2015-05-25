/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require */

define([
        './behaviors/BackboneFormBehavior',

        './fields/CommonField',

        './editors/BooleanEditorView',
        './editors/NumberEditorView',
        './editors/TextAreaEditorView',
        './editors/TextEditorView',
        './editors/ReferenceEditorView',
        './editors/MemberSelectEditorView',
        './editors/DropdownEditorView',
        './editors/MembersBubbleEditorView',
        './editors/DurationEditorView',

        './editors/impl/reference/controllers/DemoReferenceEditorController',
        './editors/impl/reference/controllers/DataSourceReferenceEditorController',
        './editors/impl/reference/controllers/BaseReferenceEditorController',
        './editors/impl/reference/collections/DataSourceReferenceCollection',
        './editors/impl/reference/collections/BaseReferenceCollection',
        './editors/impl/reference/models/DefaultReferenceModel',

        './validators/RequiredValidator',
        './validators/LengthValidator',
        './validators/LettersValidator',
        './validators/PasswordValidator',
        './validators/PhoneValidator'
    ],
	function (
        BackboneFormBehavior,
        CommonField,
        ExtendedForm,
        BooleanEditorView,
        NumberEditorView,
        TextAreaEditorView,
        TextEditorView,
        ReferenceEditorView,
        MemberSelectEditorView,
        DropdownEditorView,
        MembersBubbleEditorView,
        DurationEditorView,
        DemoReferenceEditorController,
        DataSourceReferenceEditorController,
        BaseReferenceEditorController,
        DataSourceReferenceCollection,
        BaseReferenceCollection,
        DefaultReferenceModel
        ) {
		'use strict';

		return {
            behaviors: {
                BackboneFormBehavior: BackboneFormBehavior
            },
            fields: {
                CommonField: CommonField
            },
			editors: {
                reference: {
                    controllers: {
                        DemoReferenceEditorController: DemoReferenceEditorController,
                        BaseReferenceEditorController: BaseReferenceEditorController,
                        DataSourceReferenceEditorController: DataSourceReferenceEditorController
                    },
                    collections: {
                        BaseReferenceCollection: BaseReferenceCollection,
                        DataSourceReferenceCollection: DataSourceReferenceCollection
                    },
                    models: {
                        DefaultReferenceModel: DefaultReferenceModel
                    }
                },
				BooleanEditor: BooleanEditorView,
				NumberEditor: NumberEditorView,
				TextAreaEditor: TextAreaEditorView,
				TextEditor: TextEditorView,
                ReferenceEditor: ReferenceEditorView,
                MemberSelectEditor: MemberSelectEditorView,
                DropdownEditor: DropdownEditorView,
                MembersBubbleEditor: MembersBubbleEditorView,
                DurationEditor: DurationEditorView
			}
		};
	});
