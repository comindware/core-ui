// @flow
import template from './templates/mentionEditor.hbs';
import dropdown from 'dropdown';
import { keyCode } from 'utils';
import BaseEditorView from './base/BaseEditorView';
import UserService from 'services/UserService';
import TextAreaEditorView from './TextAreaEditorView';
import LocalizationService from '../../services/LocalizationService';
import formRepository from '../formRepository';
import MembersListView from './impl/members/views/MembersListView';
import MembersCollection from './impl/members/collections/MembersCollection';

const defaultOptions = {
    editorOptions: undefined
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
export default (formRepository.editors.Mention = BaseEditorView.extend({
    initialize(options = {}) {
        this.__applyOptions(options, defaultOptions);
        this.__createViewModel();
    },

    __createViewModel() {
        this.viewModel = new Backbone.Model();
        const membersCollection = new MembersCollection();
        membersCollection.reset(UserService.listUsers());
        this.viewModel.set('availableMembers', membersCollection);
        this.viewModel.set(
            'membersByUserName',
            membersCollection.reduce((memo, value) => {
                memo[value.get('userName')] = value;
                return memo;
            }, {})
        );
    },

    template: Handlebars.compile(template),

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    events: {
        'keydown:captured': '__handleKeydown'
    },

    onRender() {
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
                emptyPlaceholder: LocalizationService.get('CORE.FORM.EDITORS.MENTIONS.PLACEHOLDER')
            }),
            panelView: MembersListView,
            panelViewOptions: {
                collection: this.viewModel.get('availableMembers')
            },
            autoOpen: false,
            renderAfterClose: false
        });

        this.showChildView('dropdownRegion', this.dropdownView);
        this.listenTo(this.dropdownView, 'change', this.__onTextChange);
        this.listenTo(this.dropdownView, 'focus', this.__onFocus);
        this.listenTo(this.dropdownView, 'blur', this.__onBlur);
        this.listenTo(this.dropdownView, 'input', this.__onInput);
        this.listenTo(this.dropdownView, 'caretChange', this.__onCaretChange);
        this.listenTo(this.dropdownView, 'panel:member:select', this.__onMemberSelect);
        // We discarded it during render phase, so we do it now.
        this.setPermissions(this.enabled, this.readonly);
        this.setValue(this.value);
    },

    __handleKeydown(e) {
        switch (e.keyCode) {
            case keyCode.UP:
                if (!this.dropdownView.isOpen) {
                    return true;
                }
                this.__sendPanelCommand('up');
                this.__updateMentionInText();
                return false;
            case keyCode.DOWN:
                if (!this.dropdownView.isOpen) {
                    return true;
                }
                this.__sendPanelCommand('down');
                this.__updateMentionInText();
                return false;
            case keyCode.ENTER:
            case keyCode.NUMPAD_ENTER:
                if (!this.dropdownView.isOpen) {
                    return true;
                }
                this.__updateMentionInText();
                this.dropdownView.close();
                return false;
            case keyCode.ESCAPE:
                this.dropdownView.close();
                return false;
            default:
                break;
        }
    },

    __value(value): void {
        this.setValue(value);
        this.__triggerChange();
    },

    __onTextChange(): void {
        this.value = this.dropdownView.getValue();
        this.__triggerChange();
    },

    __onFocus(): void {
        this.trigger('focus', this);
    },

    __onBlur(): void {
        this.trigger('blur', this);
    },

    __onInput(text: string, caret: { start: number, end: number }): void {
        // 1. Open dropdown when: @ is immediately before caret, @ is at start or prepended by whitespace
        // 2. Maintain dropdown open (and filter the list) when: text between caret and @ matches username pattern [a-zA-Z0-9_\.]
        // 3. Hide dropdown when: username text doesn't match
        // 4. track caret change and hide dropdown if resulting username patters doesn't match
        // 5. hide dropdown on blur

        const leftFragment = text.substring(0, caret.end);

        const regex = /(?:\s|^)@([a-z0-9_\.]*)$/i;
        const match = leftFragment.match(regex);
        if (match) {
            const userName = match[1];
            this.dropdownView.open();
            const collection = this.viewModel.get('availableMembers');
            collection.applyTextFilter(userName);
            if (collection.length === 0) {
                this.dropdownView.close();
            }
            this.mentionState = {
                start: caret.end - userName.length,
                end: caret.end,
                text
            };
        } else {
            this.dropdownView.close();
        }
    },

    __onCaretChange(text, caret) {
        if (this.dropdownView.isOpen) {
            this.__onInput(text, caret);
        }
    },

    __onMemberSelect(): void {
        this.__updateMentionInText();
        this.dropdownView.close();
    },

    __updateMentionInText(): void {
        const selectedMember = this.viewModel.get('availableMembers').selected;
        if (!selectedMember) {
            return;
        }

        const editor = this.dropdownView;
        const text = this.mentionState.text;

        let mention = selectedMember.get('userName') || '';
        if (mention && !text.substring(this.mentionState.end).match(/^\s/)) {
            mention += ' ';
        }

        const updatedText = text.substring(0, this.mentionState.start) + mention + text.substring(this.mentionState.end);
        editor.setValue(updatedText);
        editor.setCaretPos(this.mentionState.start + mention.length);
        this.value = updatedText;
        this.__triggerChange();
    },

    /**
     * Получить список пользователей, упомянутых в тексте.
     * @return {String[]} Список строковых идентификаторов пользователей, упомянутых в тексте.
     * */
    getMentions(): Array<any> {
        const text = this.getValue();
        const regex = /(?:\s|^)@([a-z0-9_\.]+)/gi;
        const members = this.viewModel.get('membersByUserName');

        const result = [];
        while (true) {
            const matches = regex.exec(text);
            if (!matches) {
                break;
            }
            const userName = matches[1];
            const member = members[userName];
            if (member) {
                result.push(member.id);
            }
        }
        return _.uniq(result);
    },

    setValue(value) {
        if (this.dropdownView) {
            this.dropdownView.setValue(value);
            this.value = this.dropdownView.getValue();
        } else {
            this.value = value;
        }
    },

    __sendPanelCommand(command, options) {
        if (this.dropdownView.isOpen) {
            this.dropdownView.panelView.handleCommand(command, options);
        }
    },

    __setEnabled(enabled: boolean): void {
        BaseEditorView.prototype.__setEnabled.call(this, enabled);
        if (this.dropdownView) {
            this.dropdownView.setEnabled(enabled);
        }
    },

    __setReadonly(readonly: boolean): void {
        BaseEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.dropdownView) {
            this.dropdownView.setReadonly(readonly);
        }
    }
}));
