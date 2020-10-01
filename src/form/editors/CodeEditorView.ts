import CodemirrorView from './impl/codeEditor/views/CodemirrorView';
import template from './impl/codeEditor/templates/codeEditor.html';
import BaseEditorView from './base/BaseEditorView';
import formRepository from '../formRepository';
import LocalizationService from '../../services/LocalizationService';

const showModes = {
    normal: 'normal',
    button: 'button'
};

const classes = {
    buttonMode: 'dev-code-editor-button-mode',
    maximized: 'dev-codemirror-maximized'
};

const defaultOptions = {
    mode: 'expression',
    height: 300,
    showMode: showModes.normal,
    ontologyService: null,
    lineSeparator: undefined,
    showDebug: true,
    config: null
};

/**
 * @name NumberEditorView
 * @memberof module:Core.form.editors
 * @class Редактор выражений и скриптов. Поддерживаемый тип данных: <code>Sting</code>.
 * @extends module:Core.form.editors.base.BaseEditorView
 * @param {String} [options.mode='expression'] Определяет тип редактора:<ul>
 *     <li><code>'expression'</code> - редактор выражений.</li>
 *     <li><code>'script'</code> - редактор C#-скриптов.</li></ul>
 * @param {Number} [options.height=150] Высота редактора в пикселях.
 * */

export default formRepository.editors.Code = BaseEditorView.extend({
    className: 'code-editor editor',

    regions: {
        editorContainer: {
            el: '.js-code-codemirror-container',
            replaceElement: true
        }
    },

    focusElement: 'textarea',

    ui: {
        editor: '.js-code-codemirror-container',
        editBtn: '.js-code-button-edit',
        clearBtn: '.js-code-button-clear'
    },

    events: {
        'click @ui.editBtn': '__onEdit',
        'click @ui.clearBtn': '__onClear',
        keydown: '__handleKeydown'
    },

    template: Handlebars.compile(template),

    templateContext() {
        return this.options;
    },

    initialize(options = {}) {
        this.__applyOptions(options, defaultOptions);
        if (this.options.showMode === showModes.button) {
            this.focusElement = '.js-code-button-edit';
        }
    },

    onRender() {
        if (this.options.showMode === showModes.button) {
            this.ui.editor.hide();
            this.editorEl.classList.add(classes.buttonMode);
            this.__setEditBtnText();
        } else {
            this.showEditor();
            this.ui.editBtn.hide();
            this.ui.clearBtn.hide();
            this.editorEl.classList.remove(classes.buttonMode);
        }
    },

    showEditor() {
        if (this.editor) {
            return;
        }
        this.editor = new CodemirrorView(this.options);

        this.editor.on('change', this.__change, this);
        this.editor.on('minimize', () => this.__onMinimize());
        this.showChildView('editorContainer', this.editor);
        this.editor.setValue(this.value || '');
        if (this.readonly) {
            this.__setReadonly(this.readonly);
        }
    },

    focus() {
        if (this.options.showMode === showModes.button) {
            this.showEditor();
            this.ui.editor.show();
            this.editor.maximize();
        } else {
            this.editor.codemirror.focus();
        }
        this.hasFocus = true;
    },

    __value(value, updateUi, triggerChange) {
        if (this.value === value) {
            return;
        }

        this.value = value;

        this.__setEditBtnText();

        if (updateUi && this.editor) {
            this.editor.setValue(value);
        }

        if (triggerChange) {
            this.__triggerChange();
        }
    },

    setValue(value) {
        if (this.editor) {
            this.editor.trigger('compile', { errors: [], warnings: [], info: [] });
        }
        this.__value(value, true, false);
    },

    async isCompilationError() {
        const isErrors = await this.editor.__isCompilationError();
        return isErrors;
    },

    __change() {
        const value = this.editor.getValue() || null;
        this.__value(value, false, true);
    },

    __onEdit(e) {
        if (!this.editor) {
            this.showEditor();
        }
        this.ui.editor.show();
        this.editor.maximize();
        e.stopPropagation();
    },

    __onMinimize() {
        if (this.options.showMode === showModes.button) {
            this.ui.editor.hide();
        }
    },

    __onClear() {
        this.__value(null, true, true);
    },

    __handleKeydown(e) {
        e.stopPropagation();
    },

    __setEditBtnText() {
        if (this.value) {
            if (this.getReadonly()) {
                this.ui.editBtn.text(LocalizationService.get('CORE.FORM.EDITORS.CODE.SHOW'));
            } else {
                const codeText = this.options.value || this.value;
                this.ui.editBtn.text(codeText);
            }
        } else {
            this.ui.editBtn.text(LocalizationService.get('CORE.FORM.EDITORS.CODE.EMPTY'));
        }
    },

    __setReadonly(readonly) {
        BaseEditorView.prototype.__setReadonly.call(this, readonly);
        this.editor?.setReadonly(readonly);
        if (this.options.showMode === showModes.button) {
            this.__setEditBtnText();
        }
    }
});
