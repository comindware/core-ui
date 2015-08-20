/**
 * Developer: Stepan Burguchev
 * Date: 8/19/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'text!./templates/mentionEditor.html',
    'module/lib',
    'core/dropdown/dropdownApi',
    'core/utils/utilsApi',
    'core/serviceLocator',
    './base/BaseLayoutEditorView',
    './impl/common/members/services/factory',
    './TextAreaEditorView'
], function (
    template,
    lib,
    dropdown,
    utils,
    serviceLocator,
    BaseLayoutEditorView,
    membersFactory,
    TextAreaEditorView) {
    'use strict';

    var defaultOptions = {
        editorOptions: null
    };

    Backbone.Form.editors.Mention = BaseLayoutEditorView.extend({
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
            this.viewModel.set('availableMembers', membersFactory.createMembersCollection());
        },

        template: Handlebars.compile(template),

        regions: {
            dropdownRegion: '.js-dropdown-region'
        },

        onRender: function () {
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
                    autocommit: this.options.autocommit
                }),
                panelView: membersFactory.getMembersListView(),
                panelViewOptions: {
                    collection: this.viewModel.get('availableMembers')
                },
                autoOpen: false,
                renderAfterClose: false
            });
            this.dropdownRegion.show(this.dropdownView);

            this.listenTo(this.dropdownView, 'open', this.__onDropdownOpen);
            this.listenTo(this.dropdownView, 'button:change', this.__onTextChange);
            this.listenTo(this.dropdownView, 'button:focus', this.__onFocus);
            this.listenTo(this.dropdownView, 'button:blur', this.__onBlur);
            this.listenTo(this.dropdownView, 'button:input', this.__onInput);
            _.each(this.keyboardShortcuts, function (v, k) {
                this.dropdownView.button.addKeyboardListener(k, v.bind(this));
            }, this);
        },

        keyboardShortcuts: {
            'up': function () {
                this.__sendPanelCommand('up');
                this.__updateMentionInText();
            },
            'down': function () {
                this.__sendPanelCommand('down');
                this.__updateMentionInText();
            },
            'enter,num_enter': function () {
                if (!this.dropdownView.isOpen) {
                    return;
                }
                this.__updateMentionInText();
                this.dropdownView.close();
            },
            'escape': function () {
                this.dropdownView.close();
            }
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
            // 4. TODO: track caret change and hide dropdown if resulting username patters doesn't match
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

        __updateMentionInText: function () {
            var selectedMember = this.viewModel.get('availableMembers').selected;
            if (!selectedMember) {
                return;
            }

            var editor = this.dropdownView.button;
            var text = this.mentionState.text;

            var mention = selectedMember.get('userName') || '';
            if (mention && !text.match(/^\s/)) {
                mention += ' ';
            }

            var updatedText = text.substring(0, this.mentionState.start) +
                mention +
                text.substring(this.mentionState.end);
            editor.setValue(updatedText);
            editor.setCaretPos(this.mentionState.start + mention.length);
        },

        getMentions: function () {
            var text = this.getValue();
            var regex = /(?:\s|^)@([a-z0-9_\.]+)/gi;

            while (true) {
                var matches = regex.exec(text);
                if (!matches) {
                    break;
                }
                var userName = matches[1];
                debugger;
            }
        },

        setValue: function (value) {
            this.dropdownView.button.setValue(value);
            this.value = this.dropdownView.button.getValue();
        },

        __sendPanelCommand: function (command, options) {
            if (this.dropdownView.isOpen) {
                this.dropdownView.panelView.handleCommand(command, options);
            }
        },

        __setEnabled: function (enabled) {
            BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
            this.dropdownView.button.setEnabled(enabled);
        },

        __setReadonly: function (readonly) {
            BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
            this.dropdownView.button.setReadonly(readonly);
        }
    });

    return Backbone.Form.editors.Mention;
});
