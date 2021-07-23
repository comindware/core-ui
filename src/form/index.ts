import BackboneFormBehavior from './behaviors/BackboneFormBehavior';
import FieldView from './fields/FieldView';
import BaseEditorView from './editors/base/BaseEditorView';
import BaseCollectionEditorView from './editors/base/BaseCollectionEditorView';
import BooleanEditorView from './editors/BooleanEditorView';
import BooleanGroupEditorView from './editors/BooleanGroupEditorView';
import NumberEditorView from './editors/NumberEditorView';
import TextAreaEditorView from './editors/TextAreaEditorView';
import TextEditorView from './editors/TextEditorView';
import PasswordEditorView from './editors/PasswordEditorView';
import DatalistEditorView from './editors/DatalistEditorView';
import DurationEditorView from './editors/DurationEditorView';
import RadioGroupEditorView from './editors/RadioGroupEditorView';
import DateEditorView from './editors/DateEditorView';
import TimeEditorView from './editors/TimeEditorView';
import DateTimeEditorView from './editors/DateTimeEditorView';
import initializeDatePicker from './editors/impl/dateTime/views/initializeDatePicker';
import MentionEditorView from './editors/MentionEditorView';
import AvatarEditorView from './editors/AvatarEditorView';
import DocumentEditorView from './editors/DocumentEditorView';
import ImageEditorView from './editors/ImageEditorView';
import CodeEditorView from './editors/CodeEditorView';
import ContextSelectEditorView from './editors/ContextSelectEditorView';
import MembersSplitEditorView from './editors/MembersSplitEditorView';
import ExtensionIconService from './editors/impl/document/services/ExtensionIconService';
import ComplexEditorView from './editors/ComplexEditorView';
import editorsImplCommonMembersFactory from './editors/impl/members/services/factory';
import editorsImplCommonMembersCollection from './editors/impl/members/collections/MembersCollection';
import editorsImplCommonMemberModel from './editors/impl/members/models/MemberModel';
import IconEditorView from './editors/IconEditorView';
import BaseAvatarEditorController from './editors/impl/avatar/controllers/BaseAvatarEditorController';
import DemoAvatarEditorController from './editors/impl/avatar/controllers/DemoAvatarEditorController';
import DemoReferenceEditorController from './editors/impl/datalist/controllers/DemoReferenceEditorController';
import BaseReferenceEditorController from './editors/impl/datalist/controllers/BaseReferenceEditorController';
import BaseReferenceCollection from './editors/impl/datalist/collections/BaseReferenceCollection';
import DemoReferenceCollection from './editors/impl/datalist/collections/DemoReferenceCollection';
import DefaultReferenceModel from './editors/impl/datalist/models/DefaultReferenceModel';
import DatalistButtonView from './editors/impl/datalist/views/ButtonView';
import ColorPickerEditor from './editors/ColorPickerEditor';
import RangeEditor from './editors/RangeEditor';
import AudioEditor from './editors/AudioEditor';
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
                },
                initializeDatePicker
            }
        },
        /**
         * Base classes for implementing editors on various Marionette Views.
         * @namespace
         * */
        base: {
            BaseEditorView,
            BaseCollectionEditorView
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
                BaseReferenceEditorController
            },
            collections: {
                BaseReferenceCollection,
                DemoReferenceCollection
            },
            models: {
                DefaultReferenceModel
            },
            views: {
                DatalistButtonView
            }
        },
        BooleanEditor: BooleanEditorView,
        BooleanGroupEditor: BooleanGroupEditorView,
        NumberEditor: NumberEditorView,
        TextAreaEditor: TextAreaEditorView,
        TextEditor: TextEditorView,
        PasswordEditor: PasswordEditorView,
        DatalistEditor: DatalistEditorView,
        DurationEditor: DurationEditorView,
        RadioGroupEditor: RadioGroupEditorView,
        DateEditor: DateEditorView,
        TimeEditor: TimeEditorView,
        DateTimeEditor: DateTimeEditorView,
        MentionEditor: MentionEditorView,
        AvatarEditor: AvatarEditorView,
        DocumentEditor: DocumentEditorView,
        ImageEditor: ImageEditorView,
        CodeEditor: CodeEditorView,
        ContextSelectEditor: ContextSelectEditorView,
        MembersSplitEditor: MembersSplitEditorView,
        ComplexEditor: ComplexEditorView,
        IconEditor: IconEditorView,
        ColorPickerEditor,
        RangeEditor,
        AudioEditor,
        ExtensionIconService
    }
};

export default api;
export const editors = api.editors;
export const behaviors = api.behaviors;
