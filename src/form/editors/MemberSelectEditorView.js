/**
 * Developer: Stepan Burguchev
 * Date: 1/28/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

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
    initialize(options) {
        _.defaults(this.options, defaultOptions, _.pick(options.schema ? options.schema : options, _.keys(defaultOptions)));

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

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    className: 'users-list editor',

    template: Handlebars.compile(template),

    setValue(value) {
        this.__value(_.isArray(value) ? (value.length ? value[0] : null) : value, false);
    },

    onRender() {
        // dropdown
        const dropdownOptions = _.extend({
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
        this.listenTo(this.dropdownView, 'panel:cancel', this.__onCancel);
        this.dropdownRegion.show(this.dropdownView);
        // hotkeys
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.el);
        _.each('down,enter,num_enter'.split(','), key => {
            this.keyListener.simple_combo(key, () => {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.dropdownView.open();
                }
            });
        });
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.viewModel.get('button').set('member', this.__findModel(value));
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    onValueClear() {
        this.__value(null, true);
        this.focus();
    },

    onValueSet(value) {
        this.__value(value, true);
        this.dropdownView.close();
        this.$el.focus();
    },

    onValueNavigate() {
    },

    onFilterText(options) {
        const deferred = $.Deferred();
        const text = options.text.toLocaleLowerCase();
        this.collection.unhighlight();
        if (text === '') {
            this.collection.filter(null);
        } else {
            this.collection.filter(model => {
                const fullName = (model.get('name') || '').toLocaleLowerCase();
                return fullName.indexOf(text) !== -1;
            });
            this.collection.highlight(text);
        }
        deferred.resolve();
        return deferred.promise();
    },

    onPanelOpen() {
        if (this.getEnabled() && !this.getReadonly()) {
            this.dropdownView.open();
        }
    },

    __initCollection() {
        const users = UserService.listUsers();
        this.collection = new MembersCollection(new Backbone.Collection(users, {
            model: MemberModel
        }), {
            comparator: helpers.comparatorFor(comparators.stringComparator2Asc, 'name')
        });
        this.viewModel.get('button').set('member', this.__findModel(this.getValue()));
        this.viewModel.get('panel').set('collection', this.collection);
    },

    __findModel(value) {
        return this.collection.findWhere({ id: value });
    },

    __setEnabled(enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        this.viewModel.get('button').set('enabled', this.getEnabled() && !this.getReadonly());
        this.$el.prop('tabindex', readonly ? -1 : 0);
    },

    __onCancel() {
        this.dropdownView.close();
        this.$el.focus();
    }
});

export default formRepository.editors.MemberSelect;
