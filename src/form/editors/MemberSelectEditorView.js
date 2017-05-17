/**
 * Developer: Stepan Burguchev
 * Date: 1/28/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars, keypress } from 'lib';
import { helpers, comparators } from 'utils';
import dropdown from 'dropdown';
import template from './templates/memberSelectEditor.hbs';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import UserService from 'services/UserService';
import DefaultButtonView from './impl/memberSelect/views/DefaultButtonView';
import PanelView from './impl/memberSelect/views/PanelView';
import MemberModel from './impl/common/members/models/MemberModel';
import MembersCollection from './impl/common/members/collections/MembersCollection';
import formRepository from '../formRepository';

const defaultOptions = {
    dropdownOptions: {
        buttonView: DefaultButtonView,
        popoutFlow: 'right',
        customAnchor: true
    }
};

const ButtonModel = Backbone.AssociatedModel.extend({
    relations: [
        {
            type: Backbone.One,
            key: 'member',
            relatedModel: MemberModel
        }
    ]
});

/**
 * @name MemberSelectEditorView
 * @memberof module:core.form.editors
 * @class Редактор для выбора пользователя из списка доступных. Поддерживаемый тип данных: <code>String</code>
 * (идентификатор пользователя). Например, <code>'user.1'</code>. Список доступных пользователей
 * берется из <code>core.services.CacheService</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number} [options.dropdownOptions=Object] Опции используемого PopoutView.
 * Полезно для задания направления открытия и кастомизации кнопки. Значения по умолчанию:
 * <code>{ buttonView: DefaultButtonView, popoutFlow: 'right', customAnchor: true }</code>
 * */
formRepository.editors.MemberSelect = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.MemberSelectEditorView.prototype */{
    initialize: function (options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }
        _.defaults(this.options.dropdownOptions, defaultOptions.dropdownOptions);

        this.reqres = new Backbone.Wreqr.RequestResponse();
        this.reqres.setHandler('value:clear', this.onValueClear, this);
        this.reqres.setHandler('value:set', this.onValueSet, this);
        this.reqres.setHandler('value:navigate', this.onValueNavigate, this);
        this.reqres.setHandler('filter:text', this.onFilterText, this);
        this.reqres.setHandler('panel:open', this.onPanelOpen, this);

        this.viewModel = new Backbone.Model({
            button: new ButtonModel({
                enabled: this.getEnabled() && !this.getReadonly()
            }),
            panel: new Backbone.Model({
            })
        });

        this.__initCollection();
    },

    focusElement: null,

    attributes: {
        tabindex: 0
    },

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'users-list',

    template: Handlebars.compile(template),

    setValue: function (value) {
        this.__value(_.isArray(value) ? (value.length ? value[0] : null) : value, false);
    },

    onRender: function () {
        // dropdown
        var dropdownOptions = _.extend({
            buttonViewOptions: {},
            panelView: PanelView,
            panelViewOptions: {
                model: this.viewModel.get('panel'),
                reqres: this.reqres
            },
            autoOpen: false
        }, this.options.dropdownOptions);
        _.extend(dropdownOptions.buttonViewOptions, {
            model: this.viewModel.get('button'),
            reqres: this.reqres
        });
        this.dropdownView = dropdown.factory.createPopout(dropdownOptions);
        this.dropdownRegion.show(this.dropdownView);
        // hotkeys
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.el);
        _.each('down,enter,num_enter'.split(','), function (key) {
            this.keyListener.simple_combo(key, function () {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            }.bind(this));
        }, this);
    },

    __value: function (value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.viewModel.get('button').set('member', this.__findModel(value));
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    onValueClear: function () {
        this.__value(null, true);
    },

    onValueSet: function (value) {
        this.__value(value, true);
        this.dropdownView.close();
        this.$el.focus();
    },

    onValueNavigate: function () {
    },

    onFilterText: function (options) {
        var deferred = $.Deferred();
        var text = options.text.toLocaleLowerCase();
        this.collection.unhighlight();
        if (text === '') {
            this.collection.filter(null);
        } else {
            this.collection.filter(function (model) {
                var fullName = (model.get('name') || '').toLocaleLowerCase();
                return fullName.indexOf(text) !== -1;
            });
            this.collection.highlight(text);
        }
        deferred.resolve();
        return deferred.promise();
    },

    onPanelOpen: function () {
        if (this.getEnabled() && !this.getReadonly()) {
            this.dropdownView.open();
        }
    },

    __initCollection: function() {
        var users = UserService.listUsers();
        this.collection = new MembersCollection(new Backbone.Collection(users, {
            model: MemberModel
        }), {
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name')
        });
        this.viewModel.get('button').set('member', this.__findModel(this.getValue()));
        this.viewModel.get('panel').set('collection', this.collection);
    },

    __findModel: function (value) {
        return this.collection.findWhere({ id: value });
    },

    __setEnabled: function (enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
    },

    __setReadonly: function (readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
    }
});

export default formRepository.editors.MemberSelect;
