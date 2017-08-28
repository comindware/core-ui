/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import BackboneFormBehavior from './behaviors/BackboneFormBehavior';
import FieldView from './fields/FieldView';
import BaseItemEditorView from './editors/base/BaseItemEditorView';
import BaseLayoutEditorView from './editors/base/BaseLayoutEditorView';
import BaseCollectionEditorView from './editors/base/BaseCollectionEditorView';
import BaseCompositeEditorView from './editors/base/BaseCompositeEditorView';
import BooleanEditorView from './editors/BooleanEditorView';
import NumberEditorView from './editors/NumberEditorView';
import TextAreaEditorView from './editors/TextAreaEditorView';
import TextEditorView from './editors/TextEditorView';
import PasswordEditorView from './editors/PasswordEditorView';
import ReferenceEditorView from './editors/ReferenceEditorView';
import MemberSelectEditorView from './editors/MemberSelectEditorView';
import DropdownEditorView from './editors/DropdownEditorView';
import MembersBubbleEditorView from './editors/MembersBubbleEditorView';
import DurationEditorView from './editors/DurationEditorView';
import RadioGroupEditorView from './editors/RadioGroupEditorView';
import DateEditorView from './editors/DateEditorView';
import TimeEditorView from './editors/TimeEditorView';
import DateTimeEditorView from './editors/DateTimeEditorView';
import MentionEditorView from './editors/MentionEditorView';
import MultiSelectEditorView from './editors/MultiSelectEditorView';
import AvatarEditorView from './editors/AvatarEditorView';
import editorsImplCommonMembersFactory from './editors/impl/common/members/services/factory';
import editorsImplCommonMembersCollection from './editors/impl/common/members/collections/MembersCollection';
import editorsImplCommonMemberModel from './editors/impl/common/members/models/MemberModel';
import BaseAvatarEditorController from './editors/impl/avatar/controllers/BaseAvatarEditorController';
import DemoAvatarEditorController from './editors/impl/avatar/controllers/DemoAvatarEditorController';
import DemoReferenceEditorController from './editors/impl/reference/controllers/DemoReferenceEditorController';
import BaseReferenceEditorController from './editors/impl/reference/controllers/BaseReferenceEditorController';
import BaseReferenceCollection from './editors/impl/reference/collections/BaseReferenceCollection';
import DefaultReferenceModel from './editors/impl/reference/models/DefaultReferenceModel';
import ReferenceListItemView from './editors/impl/reference/views/ReferenceListItemView';
import UserReferenceListItemView from './editors/impl/reference/views/UserReferenceListItemView';
import LoadingView from './editors/impl/reference/views/LoadingView';
import ReferenceButtonView from './editors/impl/reference/views/ReferenceButtonView';
import UserReferenceButtonView from './editors/impl/reference/views/UserReferenceButtonView';
import ReferencePanelView from './editors/impl/reference/views/ReferencePanelView';
import './validators/requiredValidator';
import './validators/lengthValidator';
import './validators/passwordValidator';
import './validators/phoneValidator';
import formRepository from './formRepository';

const api = /** @lends module:core.form */ {
    /**
     * Marionette.Behavior classes useful with Backbone.Form.
     * @namespace
     * */
    behaviors: {
        BackboneFormBehavior
    },
    /**
     * Repository that is used when an editor or validator is declared as string in form schema.
     * @namespace
     * */
    repository: formRepository,
    /**
     * Extended version of Backbone.Form.Field which is able to display validation errors and information tooltips.
     * @namespace
     * */
    Field: FieldView,
    /**
     * A lot of editors
     * @namespace
     * */
    editors: {
        impl: {
            common: {
                members: {
                    collections: {
                        MembersCollection: editorsImplCommonMembersCollection
                    },
                    models: {
                        MemberModel: editorsImplCommonMemberModel
                    },
                    factory: editorsImplCommonMembersFactory
                }
            }
        },
        /**
         * Base classes for implementing editors on various Marionette Views.
         * @namespace
         * */
        base: {
            BaseItemEditorView,
            BaseLayoutEditorView,
            BaseCollectionEditorView,
            BaseCompositeEditorView
        },
        /**
         * Avatar editor data providers and internal implementation.
         * @namespace
         * */
        avatar: {
            /**
             * Base implementation of data providers for AvatarEditorView.
             * @namespace
             * */
            controllers: {
                BaseAvatarEditorController,
                DemoAvatarEditorController
            }
        },
        /**
         * Reference editor data providers and internal implementation.
         * @namespace
         * */
        reference: {
            /**
             * Base implementation of data providers for ReferenceEditorView.
             * @namespace
             * */
            controllers: {
                DemoReferenceEditorController,
                BaseReferenceEditorController,
            },
            collections: {
                BaseReferenceCollection
            },
            models: {
                DefaultReferenceModel
            },
            views: {
                ReferenceListItemView,
                LoadingView,
                ReferenceButtonView,
                ReferencePanelView,
                UserReferenceButtonView,
                UserReferenceListItemView
            }
        },
        BooleanEditor: BooleanEditorView,
        NumberEditor: NumberEditorView,
        TextAreaEditor: TextAreaEditorView,
        TextEditor: TextEditorView,
        PasswordEditor: PasswordEditorView,
        ReferenceEditor: ReferenceEditorView,
        MemberSelectEditor: MemberSelectEditorView,
        DropdownEditor: DropdownEditorView,
        MembersBubbleEditor: MembersBubbleEditorView,
        DurationEditor: DurationEditorView,
        RadioGroupEditor: RadioGroupEditorView,
        DateEditor: DateEditorView,
        TimeEditor: TimeEditorView,
        DateTimeEditor: DateTimeEditorView,
        MentionEditor: MentionEditorView,
        MultiSelectEditor: MultiSelectEditorView,
        AvatarEditor: AvatarEditorView
    }
};
export default api;
export var editors = api.editors;
export var fields = api.fields;
export var behaviors = api.behaviors;
