/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import BackboneFormBehavior from './behaviors/BackboneFormBehavior';
import CommonField from './fields/CommonField';
import BaseItemEditorView from './editors/base/BaseItemEditorView';
import BaseLayoutEditorView from './editors/base/BaseLayoutEditorView';
import BaseCollectionEditorView from './editors/base/BaseCollectionEditorView';
import BaseCompositeEditorView from './editors/base/BaseCompositeEditorView';
import ExtendedForm_ from './ExtendedForm';
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
import editorsImplCommonMembersFactory from './editors/impl/common/members/services/factory';
import editorsImplCommonMembersCollection from './editors/impl/common/members/collections/MembersCollection';
import editorsImplCommonMemberModel from './editors/impl/common/members/models/MemberModel';
import DemoReferenceEditorController from './editors/impl/reference/controllers/DemoReferenceEditorController';
import DataSourceReferenceEditorController from './editors/impl/reference/controllers/DataSourceReferenceEditorController';
import BaseReferenceEditorController from './editors/impl/reference/controllers/BaseReferenceEditorController';
import DataSourceReferenceCollection from './editors/impl/reference/collections/DataSourceReferenceCollection';
import BaseReferenceCollection from './editors/impl/reference/collections/BaseReferenceCollection';
import DefaultReferenceModel from './editors/impl/reference/models/DefaultReferenceModel';
import SearchMoreModel from './editors/impl/reference/models/SearchMoreModel';
import ReferenceListItemView from './editors/impl/reference/views/ReferenceListItemView';
import SearchMoreListItemView from './editors/impl/reference/views/SearchMoreListItemView';
import LoadingView from './editors/impl/reference/views/LoadingView';
import ReferenceButtonView from './editors/impl/reference/views/ReferenceButtonView';
import ReferencePanelView from './editors/impl/reference/views/ReferencePanelView';
import './validators/requiredValidator';
import './validators/lengthValidator';
import './validators/passwordValidator';
import './validators/phoneValidator';

var api = /** @lends module:core.form */ {
    ExtendedForm: ExtendedForm_,
    /**
     * Объекты Marionette.Behaviour, упрощающие использования модуля форм.
     * @namespace
     * */
    behaviors: {
        BackboneFormBehavior: BackboneFormBehavior
    },
    /**
     * Расширенная версия Backbone.Form.Field, поддерживающая ошибки валидации и текстовые подсказки.
     * @namespace
     * */
    fields: {
        CommonField: CommonField
    },
    /**
     * Редакторы
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
         * Базовые классы для реализации редакторов.
         * @namespace
         * */
        base: {
            BaseItemEditorView: BaseItemEditorView,
            BaseLayoutEditorView: BaseLayoutEditorView,
            BaseCollectionEditorView: BaseCollectionEditorView,
            BaseCompositeEditorView: BaseCompositeEditorView
        },
        /**
         * Объекты для использования и кастомизации редактора ReferenceEditorView.
         * @namespace
         * */
        reference: {
            /**
             * Базовая реализация дата-провайдеров для ReferenceEditorView.
             * @namespace
             * */
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
        PasswordEditor:PasswordEditorView,
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
        MultiSelectEditor: MultiSelectEditorView
    }
};
export default api;
export var editors = api.editors;
export var fields = api.fields;
export var behaviors = api.behaviors;
export var ExtendedForm = api.ExtendedForm;
