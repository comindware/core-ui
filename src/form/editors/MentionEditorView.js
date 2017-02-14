/**
 * Developer: Stepan Burguchev
 * Date: 8/19/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import template from './templates/mentionEditor.hbs';
import { Handlebars } from '../../libApi';
import dropdown from '../../dropdown/dropdownApi';
import '../../utils/utilsApi';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import membersFactory from './impl/common/members/services/factory';
import TextAreaEditorView from './TextAreaEditorView';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';

const defaultOptions = {
    editorOptions: null
};

/**
 * @name MentionEditorView
 * @memberof module:core.form.editors
 * @class Текстовый редактор с возможностью упоминания пользователей (mentions). Поддерживаемый тип данных: <code>String</code>
 * (простой многострочный текст). Например, <code>'Hello, @alex!'</code>. Список доступных пользователей
 * берется из <code>core.services.CacheService</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Number} [options.editorOptions=Object] Опции для используемого {@link module:core.form.editors.TextAreaEditorView TextAreaEditorView}.
 * */
formRepository.editors.Mention = BaseLayoutEditorView.extend(/** @lends module:core.form.editors.MentionEditorView.prototype */{
    initialize: function (options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.__createViewModel();
    },

    focusElement: null,

    __createViewModel: function () {
        this.viewModel = new Backbone.Model();
        var membersCollection = membersFactory.createMembersCollection();
        this.viewModel.set('availableMembers', membersCollection);
        this.viewModel.set('membersByUserName', membersCollection.reduce(function (memo, value) {
            memo[value.get('userName')] = value;
            return memo;
        }, {}));
    },

    template: Handlebars.compile(template),

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    onShow: function () {
        if (this.dropdownView) {
            this.stopListening(this.dropdownView);
        }
        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: TextAreaEditorView,
            buttonViewOptions: _.extend({}, this.options.editorOptions || {}, {
                model: this.model,
                readonly: this.getReadonly(),
                enabled: this.getEnabled(),
                key: this.key,
                autocommit: this.options.autocommit,
                emptyPlaceholder:LocalizationService.get('CORE.FORM.EDITORS.MENTIONS.PLACEHOLDER')
            }),
            panelView: membersFactory.getMembersListView(),
            panelViewOptions: {
                collection: this.viewModel.get('availableMembers')
            },
            autoOpen: false,
            renderAfterClose: false
        });

        this.dropdownRegion.show(this.dropdownView);
        this.listenTo(this.dropdownView, 'button:change', this.__onTextChange);
        this.listenTo(this.dropdownView, 'button:focus', this.__onFocus);
        this.listenTo(this.dropdownView, 'button:blur', this.__onBlur);
        this.listenTo(this.dropdownView, 'button:input', this.__onInput);
        this.listenTo(this.dropdownView, 'button:caretChange', this.__onCaretChange);
        this.listenTo(this.dropdownView, 'panel:member:select', this.__onMemberSelect);
        _.each(this.keyboardShortcuts, function (v, k) {
            this.dropdownView.button.addKeyboardListener(k, v.bind(this));
        }, this);

        // We discarded it during render phase, so we do it now.
        this.setPermissions(this.enabled, this.readonly);
        this.setValue(this.value);
    },

    keyboardShortcuts: {
        'up': function () {
            if (!this.dropdownView.isOpen) {
                return true;
            }
            this.__sendPanelCommand('up');
            this.__updateMentionInText();
        },
        'down': function () {
            if (!this.dropdownView.isOpen) {
                return true;
            }
            this.__sendPanelCommand('down');
            this.__updateMentionInText();
        },
        'enter,num_enter': function () {
            if (!this.dropdownView.isOpen) {
                return true;
            }
            this.__updateMentionInText();
            this.dropdownView.close();
        },
        'escape': function () {
            this.dropdownView.close();
        }
    },

    __value: function (value) {
        this.setValue(value);
        this.__triggerChange();
    },

    __onTextChange: function () {
        this.value = this.dropdownView.button.getValue();
        this.__triggerChange();
    },

    __onFocus: function () {
        this.trigger('focus', this);
    },

    __onBlur: function () {
        this.trigger('blur', this);
    },

    __onInput: function (text, caret) {
        // 1. Open dropdown when: @ is immediately before caret, @ is at start or prepended by whitespace
        // 2. Maintain dropdown open (and filter the list) when: text between caret and @ matches username pattern [a-zA-Z0-9_\.]
        // 3. Hide dropdown when: username text doesn't match
        // 4. track caret change and hide dropdown if resulting username patters doesn't match
        // 5. hide dropdown on blur

        var leftFragment = text.substring(0, caret.end);

        var regex = /(?:\s|^)@([a-z0-9_\.]*)$/i;
        var match = leftFragment.match(regex);
        if (match) {
            var userName = match[1];
            this.dropdownView.open();
            var collection = this.viewModel.get('availableMembers');
            collection.applyTextFilter(userName);
            if (collection.length === 0) {
                this.dropdownView.close();
            }
            this.mentionState = {
                start: caret.end - userName.length,
                end: caret.end,
                text: text
            };
        } else {
            this.dropdownView.close();
        }
    },

    __onCaretChange: function (text, caret) {
        if (this.dropdownView.isOpen) {
            this.__onInput(text, caret);
        }
    },

    __onMemberSelect: function () {
        this.__updateMentionInText();
        this.dropdownView.close();
    },

    __updateMentionInText: function () {
        var selectedMember = this.viewModel.get('availableMembers').selected;
        if (!selectedMember) {
            return;
        }

        var editor = this.dropdownView.button;
        var text = this.mentionState.text;

        var mention = selectedMember.get('userName') || '';
        if (mention && !text.substring(this.mentionState.end).match(/^\s/)) {
            mention += ' ';
        }

        var updatedText = text.substring(0, this.mentionState.start) +
            mention +
            text.substring(this.mentionState.end);
        editor.setValue(updatedText);
        editor.setCaretPos(this.mentionState.start + mention.length);
        this.value = updatedText;
        this.__triggerChange();
    },

    /**
     * Получить список пользователей, упомянутых в тексте.
     * @return {String[]} Список строковых идентификаторов пользователей, упомянутых в тексте.
     * */
    getMentions: function () {
        var text = this.getValue();
        var regex = /(?:\s|^)@([a-z0-9_\.]+)/gi;
        var members = this.viewModel.get('membersByUserName');

        var result = [];
        while (true) {
            var matches = regex.exec(text);
            if (!matches) {
                break;
            }
            var userName = matches[1];
            var member = members[userName];
            if (member) {
                result.push(member.id);
            }
        }
        return _.uniq(result);
    },

    setValue: function (value) {
        if (this.dropdownView) {
            this.dropdownView.button.setValue(value);
            this.value = this.dropdownView.button.getValue();
        } else {
            this.value = value;
        }
    },

    __sendPanelCommand: function (command, options) {
        if (this.dropdownView.isOpen) {
            this.dropdownView.panelView.handleCommand(command, options);
        }
    },

    __setEnabled: function (enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        if (this.dropdownView) {
            this.dropdownView.button.setEnabled(enabled);
        }
    },

    __setReadonly: function (readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.dropdownView) {
            this.dropdownView.button.setReadonly(readonly);
        }
    }
});

export default formRepository.editors.Mention;
