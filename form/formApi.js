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

        './editors/base/BaseItemEditorView',
        './editors/base/BaseLayoutEditorView',
        './editors/base/BaseCollectionEditorView',
        './editors/base/BaseCompositeEditorView',

        './ExtendedForm',

        './editors/BooleanEditorView',
        './editors/NumberEditorView',
        './editors/TextAreaEditorView',
        './editors/TextEditorView',
        './editors/ReferenceEditorView',
        './editors/MemberSelectEditorView',
        './editors/DropdownEditorView',
        './editors/MembersBubbleEditorView',
        './editors/DurationEditorView',
        './editors/RadioGroupEditorView',

        './editors/impl/reference/controllers/DemoReferenceEditorController',
        './editors/impl/reference/controllers/DataSourceReferenceEditorController',
        './editors/impl/reference/controllers/BaseReferenceEditorController',
        './editors/impl/reference/collections/DataSourceReferenceCollection',
        './editors/impl/reference/collections/BaseReferenceCollection',
        './editors/impl/reference/models/DefaultReferenceModel',
        './editors/impl/reference/models/SearchMoreModel',
        './editors/impl/reference/views/ReferenceListItemView',
        './editors/impl/reference/views/SearchMoreListItemView',
        './editors/impl/reference/views/LoadingView',
        './editors/impl/reference/views/ReferenceButtonView',
        './editors/impl/reference/views/ReferencePanelView',

        './validators/RequiredValidator',
        './validators/LengthValidator',
        './validators/LettersValidator',
        './validators/PasswordValidator',
        './validators/PhoneValidator'
    ],
	function (
        BackboneFormBehavior,
        CommonField,
        BaseItemEditorView,
        BaseLayoutEditorView,
        BaseCollectionEditorView,
        BaseCompositeEditorView,
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
        RadioGroupEditorView,

        DemoReferenceEditorController,
        DataSourceReferenceEditorController,
        BaseReferenceEditorController,
        DataSourceReferenceCollection,
        BaseReferenceCollection,
        DefaultReferenceModel,
        SearchMoreModel,
        ReferenceListItemView,
        SearchMoreListItemView,
        LoadingView,
        ReferenceButtonView,
        ReferencePanelView
        ) {
		'use strict';

		return {
            ExtendedForm: ExtendedForm,
            behaviors: {
                BackboneFormBehavior: BackboneFormBehavior
            },
            fields: {
                CommonField: CommonField
            },
			editors: {
                base: {
                    BaseItemEditorView: BaseItemEditorView,
                    BaseLayoutEditorView: BaseLayoutEditorView,
                    BaseCollectionEditorView: BaseCollectionEditorView,
                    BaseCompositeEditorView: BaseCompositeEditorView
                },
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
                        DefaultReferenceModel: DefaultReferenceModel,
                        SearchMoreModel: SearchMoreModel
                    },
                    views: {
                        ReferenceListItemView: ReferenceListItemView,
                        SearchMoreListItemView: SearchMoreListItemView,
                        LoadingView: LoadingView,
                        ReferenceButtonView: ReferenceButtonView,
                        ReferencePanelView: ReferencePanelView
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
                DurationEditor: DurationEditorView,
                RadioGroupEditor: RadioGroupEditorView
			}
		};
	});
