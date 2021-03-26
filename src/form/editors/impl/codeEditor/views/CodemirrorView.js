import { codemirror } from 'lib';
import { keyCode } from 'utils';
import WindowService from 'services/WindowService';
import ToolbarView from './ToolbarView';
import OutputView from './OutputView';
import template from '../templates/codemirror.html';
import MappingService from '../services/MappingService';
import CmwCodeAssistantServices from '../services/CmwCodeAssistantServices';
import constants from '../Constants';
import LocalizationService from '../../../../../services/LocalizationService';
import GlobalEventService from '../../../../../services/GlobalEventService';
import LoadingBehavior from '../../../../../views/behaviors/LoadingBehavior';
import getIconPrefixer from '../../../../../utils/handlebars/getIconPrefixer';
import { contextIconType } from '../../../../../Meta';
import '../../../../../../node_modules/codemirror/mode/turtle/turtle';

const showModes = {
    normal: 'normal',
    button: 'button'
};

const TOOLTIP_PADDING_PX = 15;
const CHECK_VISIBILITY_DELAY = 200;

const classes = constants.classes;
const types = constants.types;

const lineSeparatorLF = '\n';

export default Marionette.View.extend({
    initialize(options = {}) {
        this.tt = new Backbone.Model();
        this.isCallMethodAnywhere = false;
        this.getCmwOntology = CmwCodeAssistantServices.getCmwOntology.bind(this);
        _.bindAll(
            this,
            '__onBlur',
            '__callMethodAnywere',
            '__onChange',
            '__onClose',
            '__showHint',
            '__find',
            '__undo',
            '__redo',
            '__format',
            '__cmwHint',
            '__getLocalVariablesN3',
            '__showTooltip',
            '__hideTooltip',
            '__onMouseover',
            '__onMouseleave',
            '__onKeyDown',
            '__onMinimize',
            '__countOffset',
            '__showCSharpHint',
            '__jumpToLine',
            '__compile',
            '__noSuggestionHint',
            '__checkComments',
            '__countLineAndColumn',
            '__hideHintOnClick',
            '__isStringLiteral',
            '__getTooltipCsharpModel',
            '__showHintsN3_ctr_space',
            '__getAttributeNotation3',
            '__mapFormatHintsN3',
            '__changeTemplate',
            '__getPrefixN3',
            '__setVariablesN3ForHint',
            '__cleanCSharpInfoList',
            '__showOtherHintsN3',
            '__getAttributeN3'
        );
        this.intelliAssist = options.ontologyService;
        if (options.mode === constants.mode.script) {
            codemirror.hintWords[constants.languages.script] = [];
        }
    },

    behaviors: {
        LoadingBehavior: {
            behaviorClass: LoadingBehavior,
            region: 'loadingRegion'
        }
    },

    regions: {
        loadingRegion: '.js-loading-region',
        ediorHeaderContainer: {
            replaceElement: true,
            el: '.js-code-header-container'
        },
        toolbarContainer: {
            replaceElement: true,
            el: '.js-code-toolbar-container'
        },
        tooltipContainer: {
            replaceElement: true,
            el: '.js-code-tooltip-container'
        },
        editorContainer: {
            replaceElement: true,
            el: '.js-code-editor-container'
        },
        editorOutputContainer: {
            replaceElement: true,
            el: '.js-code-output-container'
        },
        outputTabs: '.output-tabs-region',
        output: '.dev-code-editor-output'
    },

    ui: {
        toolbar: '.js-code-toolbar-container',
        editor: '.js-code-editor-container',
        hints: 'CodeMirror-hints'
    },

    template: Handlebars.compile(template),

    className: 'dev-codemirror',

    attributes() {
        return {
            tabindex: 0
        };
    },

    onRender() {
        this.toolbar = new ToolbarView({ maximized: this.options.maximized, showMode: this.options.showMode, editor: this, mode: this.options.mode });
        this.toolbar.on('undo', this.__undo);
        this.toolbar.on('redo', this.__redo);
        this.toolbar.on('format', this.__format);
        this.toolbar.on('find', this.__find);
        this.toolbar.on('save', this.__onSave);
        this.toolbar.on('compile', this.__compile);
        this.toolbar.on('maximize', () => {
            this.__onMaximize();
            this.trigger('maximize', this);
        });
        this.toolbar.on('minimize', this.__onMinimize);
        this.toolbar.on('code:editor:close', this.__onClose);
        this.listenTo(GlobalEventService, 'window:mousedown:captured', this.__hideHintOnClick);
        this.showChildView('toolbarContainer', this.toolbar);
        if (this.options.showDebug !== false) {
            this.editor = this;
            this.tt.set('errors', new Backbone.Collection([]));
            this.tt.set('warnings', new Backbone.Collection([]));
            this.tt.set('info', new Backbone.Collection([]));
            this.output = new OutputView({
                editor: this.editor,
                model: this.tt
            });
            this.showChildView('editorOutputContainer', this.output);
        }

        this.hintIsShown = false;

        const extraKeys = {
            'Ctrl-Space': this.__callMethodAnywere,
            'Alt-F': this.__format
        };

        this.codemirror = codemirror(this.ui.editor[0], {
            extraKeys,
            lineNumbers: true,
            mode: constants.languages[this.options.mode],
            ontologyObjects: [],
            lineSeparator: lineSeparatorLF,
            matchBrackets: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            lint: true,
            indentUnit: 4,
            foldGutter: true,
            theme: Core.services.ThemeService.isThemeShadeIsDark() ? 'pastel-on-dark' : 'default',
            selectionPointer: true,
            showTrailingSpace: true,
            fixedGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            scrollbarStyle: 'native',
            highlightSelectionMatches: {
                minChars: 3,
                showToken: /\w/
            },
            hintOptions: {
                completeOnSingleClick: false,
                completeSingle: false,
                closeOnUnfocus: false,
                container: this.el
            }
        });

        this.codemirror.on('blur', this.__onBlur);
        this.codemirror.on('change', (editor, change) => this.__onChange({ change }));
        this.codemirror.on('keydown', this.__onKeyDown);
        this.codemirror.on('endCompletion', () => {
            this.__hideTooltip();
            this.isExternalChange = true;
            this.hintIsShown = false;
        });
        if (this.options.mode === constants.mode.expression) {
            this.codemirror.getWrapperElement().onmouseover = this.__onMouseover;
            this.codemirror.getWrapperElement().onmouseleave = this.__onMouseleave;
        }
        this.codemirror.on('inputRead', (editor, change) => this.__inputСharacterСhecking({ change }));
        this.listenTo(this.output, 'changeCursorPos', (pos, type) => {
            document.querySelector('.dev-codemirror').scrollTop = 0;
            if (this.currentHighlightedLine) {
                this.codemirror.removeLineClass(this.currentHighlightedLine, 'background', 'dev-code-editor-error');
                this.codemirror.removeLineClass(this.currentHighlightedLine, 'background', 'dev-code-editor-warning');
            }
            this.codemirror.focus();
            this.__jumpToLine(pos.line);
            if (type === 'error') {
                this.codemirror.addLineClass(pos.line, 'background', 'dev-code-editor-error');
            }
            if (type === 'warning') {
                this.codemirror.addLineClass(pos.line, 'background', 'dev-code-editor-warning');
            }
            this.codemirror.setCursor(pos);
            this.currentHighlightedLine = pos.line;
        });
        this.codemirror.setSize(null, this.options.height);
    },

    __inputСharacterСhecking(options = {}) {
        this.__resetN3Hints();
        const { change } = options;
        let symbolsForFilter;
        const isPasteOrigin = change.origin === constants.originChange.paste;
        if (!this.intelliAssist || isPasteOrigin) {
            return;
        }
        const inputSymbol = change.text[0];
        const isNotLetter = !/\w/.test(inputSymbol);

        if (isNotLetter) {
            this.CSharpInfoList = null;
        }
        const { valueLine, column } = this.__getOptionCodemirror([constants.optionsCodemirror.valueLine, constants.optionsCodemirror.column]);
        switch (this.options.mode) {
            case constants.mode.script:
                if (inputSymbol === constants.activeSymbol.point) {
                    this.filterCSharpList = null;
                    this.isCallMethodAnywhere = false;
                    this.numberLineCallHints = this.codemirror.getCursor().line;
                    this.__showCSharpHint();
                } else if (this.CSharpInfoList && this.CSharpInfoList.length) {
                    symbolsForFilter = this.__getObjectNameFilter({ mode: constants.mode.script });
                    if (symbolsForFilter && symbolsForFilter.length) {
                        this.__showFilterHints({ symbolsForFilter, mode: constants.mode.script });
                    } else {
                        this.filterCSharpList = null;
                    }
                }
                break;
            case constants.mode.expression:
                this.codemirror.showHint({ hint: this.__cmwHint });
                break;
            case constants.mode.notation3:
                if (this.__isCommentN3(valueLine, column)) {
                    break;
                }
                this.__showHintN3(inputSymbol);
                break;
            default:
                break;
        }
    },

    __showHintN3(inputSymbol) {
        switch (inputSymbol) {
            case constants.activeSymbolNotation3.questionMark:
                this.modeHintsForN3 = constants.modeHintsForN3.questionMark;
                this.__setVariablesN3ForHint();
                break;
            case constants.activeSymbolNotation3.at:
                this.modeHintsForN3 = constants.modeHintsForN3.prefix;
                this.codemirror.showHint({ hint: this.__getPrefixN3 });
                break;
            case constants.activeSymbolNotation3.colon:
                this.attributesN3 = null;
                this.modeHintsForN3 = constants.modeHintsForN3.colon;
                this.codemirror.showHint({ hint: this.__getAttributeN3 });
                break;
            default:
                this.__showFilterHintsN3();
                break;
        }
    },

    __showFilterHintsN3() {
        const symbolsForFilter = this.__getObjectNameFilter({ mode: constants.mode.notation3 });
        if (symbolsForFilter && symbolsForFilter.length) {
            this.__showFilterHints({ symbolsForFilter, mode: constants.mode.notation3 });
        }
    },

    async __getAttributeN3() {
        const { numberLine, cursor, token } = this.__getOptionCodemirror([constants.optionsCodemirror.cursor, constants.optionsCodemirror.numberLine, constants.optionsCodemirror.token]);
        this.numberLineCallHints = numberLine;
        try {
            this.setLoading(true);
            if (!this.attributesN3) {
                this.attributesN3 = await this.__getAttributeNotation3();
                if (this.attributesN3 && !this.attributesN3.length) {
                    return this.__noSuggestionHint();
                }
            }
            const rawAttributes = this.filterAttributesN3 || this.attributesN3;
            const attributes = this.__renderConfigListToolbar(rawAttributes);
            return this.__mapFormatHintsN3(cursor.line, cursor.ch, attributes, token);
        } finally {
            this.setLoading(false);
        }
    },

    async __setVariablesN3ForHint() {
        this.listVariablesHintsNotation3 = [];
        const completeHoverQuery = {
            sourceCode: this.codemirror.getValue(),
            queryCompleteHoverType: constants.queryCompleteHoverType.completion,
            sourceType: constants.typeScript.notation3,
            cursorOffset: this.__countOffset(),
            useOntologyLibriary: false
        };
        const arrVariablesNotation3 = await this.intelliAssist.getNotation3Attribute(completeHoverQuery);
        const varNames = arrVariablesNotation3.map(el => {
            const name = el.name;
            return {
                text: `?${name}`,
                displayText: name,
                icons: contextIconType.case
            };
        });
        varNames.sort((a, b) => {
            const aName = a.displayText.toUpperCase();
            const bName = b.displayText.toUpperCase();
            if (aName > bName) {
                return 1;
            }
            if (bName > aName) {
                return -1;
            }
            return 0;
        });
        this.listVariablesHintsNotation3 = varNames;
        if (this.__countOffset() !== completeHoverQuery.cursorOffset) {
            return;
        }
        this.codemirror.showHint({ hint: this.__getLocalVariablesN3 });
    },

    async __getPrefixN3() {
        const { numberLine, column, token } = this.__getOptionCodemirror([
            constants.optionsCodemirror.numberLine,
            constants.optionsCodemirror.token,
            constants.optionsCodemirror.column
        ]);
        this.numberLineCallHints = numberLine;
        if (!this.prefixN3) {
            try {
                this.setLoading(true);
                const dataPrefix = await this.intelliAssist.getStandartPrefixN3();
                if (!dataPrefix) {
                    return this.__noSuggestionHint();
                }
                this.prefixN3 = this.__getPrefixN3Map(dataPrefix);
                this.__renderConfigListToolbar(this.prefixN3);
            } finally {
                this.setLoading(false);
            }
        }
        const listPrefixHints = this.filterListPrefixN3 || this.prefixN3;
        if (!listPrefixHints.length) {
            return this.__noSuggestionHint();
        }
        const autoCompleteObject = this.__mapFormatHintsN3(numberLine, column, listPrefixHints, token);
        this.showTooltipPrefixN3 = this.__showTooltip;
        codemirror.on(autoCompleteObject, 'select', this.showTooltipPrefixN3);
        return autoCompleteObject;
    },

    __getPrefixN3Map(dataPrefix) {
        dataPrefix.map(prefix => {
            prefix.text = `@prefix ${prefix.alias}: <${prefix.uri}>.`;
            prefix.displayText = prefix.alias;
            prefix.title = `URI: ${prefix.uri}`;
            prefix.description = prefix.description ? prefix.description : '-';
            prefix.icons = contextIconType.case;
            return prefix;
        });
        return dataPrefix;
    },

    onDestroy() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
        }
    },

    getValue() {
        return this.codemirror.getValue();
    },

    __callMethodAnywere() {
        if (this.codemirror.isReadOnly() || !this.intelliAssist) {
            return;
        }
        this.numberLineCallHints = this.codemirror.getCursor().line;
        this.isCallMethodAnywhere = true;
        this.__showHint({ isCtrSpace: true });
    },

    __showHint(options) {
        const { isCtrSpace } = options;
        this.hintIsShown = true;
        switch (this.options.mode) {
            case constants.mode.notation3:
                this.__showN3Hint();
                break;
            case constants.mode.expression:
                if (isCtrSpace) {
                    this.__showCMWHint();
                } else {
                    this.codemirror.showHint({ hint: this.__cmwHint });
                }
                break;
            case constants.mode.script:
                this.__showCSharpHint();
                break;
            default:
                break;
        }
    },

    __showN3Hint() {
        if (this.numberLineCallHints !== this.codemirror.getCursor().line) {
            this.__resetN3Hints();
        }
        const { valueLine, column } = this.__getOptionCodemirror([constants.optionsCodemirror.valueLine, constants.optionsCodemirror.column]);
        if (this.__isCommentN3(valueLine, column)) {
            return;
        }
        this.codemirror.showHint({ hint: this.__showHintsN3_ctr_space });
    },

    setValue(value) {
        this.isExternalChange = true;
        const formatValue = this.replaceLineSeparatorValue(value || '');
        this.codemirror.setValue(formatValue);
        this.refresh();
    },

    setOption(option, value) {
        this.codemirror.setOption(option, value);
    },

    getOption(option) {
        this.codemirror.getOption(option);
    },

    replaceLineSeparatorValue(value) {
        if (value && value.length) {
            const format = value.replace(/\r\n/g, lineSeparatorLF);
            return format;
        }
        return value;
    },

    refresh() {
        if (this.codemirror) {
            this.__checkVisibleAndRefresh();
        }
    },

    maximize() {
        this.toolbar.maximize();
        this.__onMaximize();
    },

    minimize() {
        this.toolbar.minimize();
        this.__onMinimize();
    },

    setReadonly(readonly) {
        if (this.codemirror) {
            this.codemirror.setOption('readOnly', readonly);
            this.toolbar.toggleToolbar(readonly);
        }
    },

    async __isCompilationError(isHideCompileMessage) {
        this.isHideCompileMessage = isHideCompileMessage;
        await this.__compile();
        const isErrors = Boolean(this.tt.get('errors')?.length);
        return isErrors;
    },

    onAttach() {
        this.parentElement = this.el.parentElement;
    },

    async __onClose() {
        if (this.options.showMode === showModes.button && this.valueAfterMaximize !== this.codemirror.getValue()) {
            const isClose = await Core.services.MessageService.showMessageDialog(
                Localizer.get('CORE.FORM.EDITORS.CODE.UNSAVEDEDITOR'), 
                Localizer.get('PROCESS.FORMDESIGNER.DIALOGMESSAGES.WARNING'), [{
                    id: true,
                    text: Localizer.get('TEAMNETWORK.COMMUNICATIONCHANNELS.DELETECHANNEL.YES')
                }, {
                    id: false,
                    text: Localizer.get('TEAMNETWORK.COMMUNICATIONCHANNELS.DELETECHANNEL.NO')
                }]);
            if (!isClose) {
                return;
            }
        }
        this.codemirror.setValue(this.valueAfterMaximize);
        this.__onMinimize();
    },

    __onSave() {
        this.__onMinimize();
    },

    __checkVisibleAndRefresh() {
        if (this.$el.height()) {
            this.codemirror.refresh();
            if (this.refreshTimerId) {
                clearTimeout(this.refreshTimerId);
            }
        } else {
            this.refreshTimerId = setTimeout(() => this.__checkVisibleAndRefresh(), CHECK_VISIBILITY_DELAY);
        }
    },

    __hideHintOnClick(target) {
        if (this.hintIsShown && !(target.classList.contains(constants.classes.hintCodemirror) || target.parentElement.classList.contains(constants.classes.hintCodemirror))) {
            this.__hideHint();
        }
    },

    __hideHint() {
        this.codemirror.showHint(''); //with that argument showHint actually hides instead
        this.hintIsShown = false;
    },

    __onMaximize() {
        this.valueAfterMaximize = this.codemirror.getValue();
        this.el.classList.add(classes.maximized);
        this.popupId = WindowService.showElInPopup(this.$el, {
            immimmediateClosing: true,
            useWrapper: false
        });
        this.codemirror.refresh();
        this.codemirror.setSize(null, '100%');
        this.codemirror.focus();
    },

    __onMinimize() {
        this.trigger('minimize', this);
        WindowService.closeElPopup(this.popupId, true);
        this.el.classList.remove(classes.maximized);
        this.codemirror.refresh();
        this.codemirror.setSize(null, this.options.height);
        this.__change();
    },

    __onBlur() {
        this.__change();
    },

    __change() {
        this.trigger('change', this);
    },

    __onChange(options = {}) {
        if (this.codemirror.isReadOnly() || !this.intelliAssist) {
            return;
        }
        const { change } = options;
        const hasNotOrigin = !change.origin;
        if (this.isExternalChange && (change?.origin === constants.originChange.inputPlus || hasNotOrigin)) {
            this.isExternalChange = false;
            return;
        }
        if (this.options.mode === constants.mode.expression || this.options.mode === constants.mode.notation3) {
            this.options.mode = this.__checkModeN3();
            this.__setLanguageModeCodemirror(this.options.mode);
            return;
        }
        this.__change();
    },

    __undo() {
        if (this.codemirror.isReadOnly()) {
            return;
        }
        this.codemirror.execCommand('undo');
        this.__change();
    },

    __redo() {
        if (this.codemirror.isReadOnly()) {
            return;
        }
        this.codemirror.execCommand('redo');
        this.__change();
    },

    __countOffset() {
        const content = this.codemirror.getValue();
        const pos = this.codemirror.getCursor();
        const contentArr = content.split('\n');

        let i = 0;
        let offset = 0;
        while (i < pos.line) {
            offset = offset + contentArr[i].length + 1;
            i++;
        }
        offset += pos.ch;
        return offset;
    },

    __countLineAndColumn(itemOffset) {
        const userOffset = itemOffset;
        const content = this.codemirror.getValue();
        let curLine = 1;
        let curColumn = 1;
        let j = 1;
        for (let i = 0; i < content.length; i++) {
            j++;
            if (i < userOffset) {
                if (content.charAt(i) === '\n') {
                    curLine++;
                    j = 1;
                }
            } else {
                curColumn = j;
                return {
                    line: curLine,
                    column: curColumn
                };
            }
        }
    },

    async __showCMWHint() {
        const { cursor, token } = this.__getOptionCodemirror([constants.optionsCodemirror.cursor, constants.optionsCodemirror.token]);
        const ontologyModel = await this.getCmwOntology({ cursor, token });
        this.codemirror.showHint({ hint: () => ontologyModel });
    },

    async __showCSharpHint() {
        if (!this.intelliAssist || this.__isStringLiteral()) {
            return;
        }
        this.setLoading(true);
        try {
            const completeHoverQuery = {
                sourceCode: this.codemirror.getValue(),
                cursorOffset: this.__countOffset(),
                sourceType: constants.typeScript.script,
                queryCompleteHoverType: constants.queryCompleteHoverType.completion,
                useOntologyLibriary: this.options.config?.useOntologyLibriary
            };
            const ontologyModel = await this.intelliAssist.getCSharpOntology(completeHoverQuery);
            this.newArr = [];
            if (ontologyModel && ontologyModel.get('infoList')) {
                ontologyModel.get('infoList').forEach(item => {
                    item.text = item.name;
                    if (item.description) {
                        const rowTooltip = item.description.split('\n');
                        if (rowTooltip.length > 1) {
                            item.title = rowTooltip[0];
                            item.description = rowTooltip[1];
                        }
                    }
                });
                this.CSharpInfoList = ontologyModel.get('infoList');
                this.line = this.codemirror.getCursor().line;
            } else {
                this.CSharpInfoList = [];
            }
            this.codemirror.showHint({ hint: this.__getTooltipCsharpModel });
        } finally {
            this.setLoading(false);
        }
    },

    __isStringLiteral() {
        const token = this.codemirror.getTokenAt(this.codemirror.getCursor());
        return token?.type === 'string';
    },

    __renderConfigListToolbar(list) {
        list.forEach(item => {
            item.render = (el, _cm, data) => {
                const icon = document.createElement('i');
                const text = document.createElement('span');
                text.setAttribute('title', data.displayText || data.text);
                const nameIcon = data.icons || data.type;
                const getIcon = getIconPrefixer(nameIcon);
                icon.className = getIcon(nameIcon);
                text.innerText = data.displayText || data.text;
                el.appendChild(icon);
                el.appendChild(text);
            };
        });
        return list;
    },

    __showFilterHints(options) {
        const { symbolsForFilter, mode } = options;
        if (!symbolsForFilter || symbolsForFilter.match(/\W/g) !== null) {
            return;
        }
        const regExpString = `^${symbolsForFilter}`;
        const re = new RegExp(regExpString, 'ig');
        if (mode === constants.mode.script) {
            this.filterCSharpList = this.CSharpInfoList.filter(item => item.name.match(re) !== null);
            this.codemirror.showHint({ hint: this.__getTooltipCsharpModel });
        } else if (mode === constants.mode.notation3) {
            switch (this.modeHintsForN3) {
                case constants.modeHintsForN3.localVariables:
                    if (this.listVariablesHintsNotation3) {
                        this.filterVariabletN3 = this.listVariablesHintsNotation3.filter(item => item.displayText.match(re) !== null);
                        this.codemirror.showHint({ hint: this.__getLocalVariablesN3 });
                        break;
                    }
                case constants.modeHintsForN3.prefix:
                    if (this.prefixN3) {
                        this.filterListPrefixN3 = this.prefixN3.filter(item => item.alias.match(re) !== null);
                        this.codemirror.showHint({ hint: this.__getPrefixN3 });
                        break;
                    }
                case constants.modeHintsForN3.colon:
                    if (this.attributesN3) {
                        this.filterAttributesN3 = this.attributesN3.filter(item => item.name.match(re) !== null);
                        this.codemirror.showHint({ hint: this.__getAttributeN3 });
                        break;
                    }
                default:
                    if (this.hintsN3intoBracket) {
                        if (this.numberLineCallHints === this.codemirror.getCursor().line) {
                            this.filterHintsNotation3 = this.hintsN3intoBracket.filter(item => item.name.match(re) !== null);
                            this.codemirror.showHint({ hint: this.__showOtherHintsN3 });
                        }
                    }
                    break;
            }
        }
    },

    __getObjectNameFilter(options) {
        let filterName;
        const { mode } = options;
        const { numberLine, column, valueLine } = this.__getOptionCodemirror([
            constants.optionsCodemirror.numberLine,
            constants.optionsCodemirror.column,
            constants.optionsCodemirror.valueLine
        ]);

        if (this.numberLineCallHints !== numberLine) {
            this.CSharpInfoList = null;
            return;
        }

        if (mode === constants.mode.script) {
            const hasDot = /\./g.test(valueLine);
            const regLastLetters = /(\w*)$/;
            if (this.isCallMethodAnywhere || hasDot) {
                filterName = valueLine.slice(0, column).match(regLastLetters)[0];
                return filterName;
            }
        } else if (mode === constants.mode.notation3) {
            const regLastСharactersWithSymbol = /.(\w*)$/;
            const filterWithDelimiter = valueLine.slice(0, column).match(regLastСharactersWithSymbol);
            if (filterWithDelimiter) {
                const firstFind = filterWithDelimiter[0];
                const firstSymbol = firstFind[0];
                filterName = filterWithDelimiter[1];
                if (firstSymbol === constants.activeSymbolNotation3.questionMark) {
                    this.modeHintsForN3 = constants.modeHintsForN3.localVariables;
                } else if (firstSymbol === constants.activeSymbolNotation3.at) {
                    this.modeHintsForN3 = constants.modeHintsForN3.prefix;
                } else if (firstSymbol === constants.activeSymbolNotation3.colon) {
                    this.modeHintsForN3 = constants.modeHintsForN3.colon;
                } else {
                    this.modeHintsForN3 = constants.modeHintsForN3.contextFromServer;
                }
                return filterName;
            }
        }
    },

    __cleanCSharpInfoList() {
        this.CSharpInfoList = [];
    },

    __getTooltipCsharpModel() {
        let autoCompleteObject = {};
        const dataList = this.filterCSharpList || this.CSharpInfoList;
        const cursor = this.codemirror.getCursor();
        const token = this.codemirror.getTokenAt(cursor);
        this.hintsBehindDot = this.codemirror.getLine(cursor.line)[token.start] === constants.activeSymbol.point;

        this.showTooltipCSharp = this.__showTooltip;
        this.cleanCSharpInfoList = this.__cleanCSharpInfoList;

        if (dataList && !dataList.length) {
            autoCompleteObject = this.__noSuggestionHint();
            return autoCompleteObject;
        }
        autoCompleteObject = {
            from: {
                line: cursor.line,
                ch: this.hintsBehindDot ? token.start + 1 : token.start
            },
            to: {
                line: cursor.line,
                ch: this.hintsBehindDot ? token.end + 1 : token.end
            },
            list: this.__renderConfigListToolbar(dataList)
        };
        codemirror.on(autoCompleteObject, 'select', this.showTooltipCSharp);
        codemirror.on(autoCompleteObject, 'pick', this.cleanCSharpInfoList);
        if (this.hintsBehindDot) {
            this.previousHintName = null;
        }
        if (this.previousHintName) {
            const indexBehhindHint = dataList.findIndex(item => item.name === this.previousHintName);
            if (indexBehhindHint >= 0) {
                autoCompleteObject.selectedHint = indexBehhindHint;
            }
        }
        this.hintIsShown = true;
        return autoCompleteObject;
    },

    __getPositionTooltip(hintEl) {
        const tooltipMargin = 10;
        const hintPanel = hintEl.parentNode;
        const hintPanelPosition = hintPanel.getBoundingClientRect();
        const hintPanelWidth = hintPanelPosition.width;
        const tooltipWidth = this.tooltip.$el.width;
        let right;
        const indentRightEdge = document.body.offsetWidth - hintPanelPosition.right;

        if (indentRightEdge < hintPanelWidth) {
            right = indentRightEdge + hintPanelWidth + tooltipMargin;
            return { top: hintPanelPosition.top, right };
        }
        let left = hintPanelPosition.left + hintPanelWidth + tooltipMargin;
        if (left + tooltipWidth > window.innerWidth) {
            left = hintPanelPosition.left - tooltipWidth - tooltipMargin;
        }

        return { top: hintPanelPosition.top, left };
    },

    __showTooltip(token, hintEl) {
        hintEl.focus();
        const tooltipType = constants.types.function;
        this.previousHintName = token.text;
        let options;
        if (!token.description) {
            return;
        }
        switch (this.options.mode) {
            case constants.mode.script:
                options = {
                    model: new Backbone.Model(token)
                };
                break;
            case constants.mode.expression:
                options = {
                    model: new Backbone.Model(this.__findObjectByText(token.text)),
                    isFull: true
                };
            case constants.mode.notation3:
                options = {
                    model: new Backbone.Model(token)
                };
                break;
            default:
                break;
        }
        const TooltipView = MappingService.getTooltipView(tooltipType);
        this.tooltip = new TooltipView(options);

        this.listenTo(this.tooltip, 'syntax:changed', syntax => (token.currentSyntax = syntax));
        this.listenTo(this.tooltip, 'peek', this.__onTooltipPeek);

        this.showChildView('tooltipContainer', this.tooltip);
        this.tooltip.setPosition(this.__getPositionTooltip(hintEl));
    },

    __countBrace(value, typeBrace) {
        const countBraceRegExp = new RegExp(`${typeBrace}`, 'gim');
        return value.match(countBraceRegExp) || [];
    },

    __checkModeN3() {
        const valueWithoutComment = this.codemirror.getValue().replace(/^#.*/gm, '');
        const firstSymbol = valueWithoutComment.trim()[0];
        if (firstSymbol === constants.activeSymbolNotation3.at || firstSymbol === constants.activeSymbolNotation3.openBrace) {
            return constants.mode.notation3;
        }
        return constants.mode.expression;
    },

    __setLanguageModeCodemirror(languageMode) {
        switch (languageMode) {
            case constants.mode.expression:
                this.codemirror.setOption('mode', constants.languages.expression);
                this.__setFunctionsHintForExpression();
                this.__closeNotationMode();
                this.__closeCSharpMode();
                break;
            case constants.mode.notation3:
                this.codemirror.setOption('mode', constants.languages.notation3);
                this.__closeExpressionMode();
                this.__closeCSharpMode();
                break;
            case constants.mode.script:
                this.codemirror.setOption('mode', constants.languages.script);
                this.__closeExpressionMode();
                this.__closeNotationMode();
                break;
            default:
                break;
        }
    },

    __closeExpressionMode() {
        codemirror.off('select', this.showTooltipCMW);
    },

    __isCommentN3(valueLine, column) {
        const subStringForFind = valueLine.slice(0, column);
        return subStringForFind.includes(constants.activeSymbolNotation3.comment);
    },

    __getOptionCodemirror(options) {
        const cursor = this.codemirror.getCursor();
        const valueLine = this.codemirror.getLine(cursor.line);
        const resultOptions = {};
        options.forEach(option => {
            switch (option) {
                case constants.optionsCodemirror.cursor:
                    resultOptions[constants.optionsCodemirror.cursor] = cursor;
                    break;
                case constants.optionsCodemirror.token:
                    resultOptions[constants.optionsCodemirror.token] = this.codemirror.getTokenAt(this.codemirror.getCursor());
                    break;
                case constants.optionsCodemirror.numberLine:
                    resultOptions[constants.optionsCodemirror.numberLine] = cursor.line;
                    break;
                case constants.optionsCodemirror.column:
                    resultOptions[constants.optionsCodemirror.column] = cursor.ch;
                    break;
                case constants.optionsCodemirror.valueLine:
                    resultOptions[constants.optionsCodemirror.valueLine] = valueLine;
                    break;
                case constants.optionsCodemirror.currentSymbol:
                    resultOptions[constants.optionsCodemirror.currentSymbol] = valueLine[cursor.ch];
                    break;
                case constants.optionsCodemirror.isOpenedLeftBracket:
                    resultOptions[constants.optionsCodemirror.isOpenedLeftBracket] = this.codemirror
                        .getLine(cursor.line)
                        .slice(0, cursor.ch)
                        .includes(constants.activeSymbolNotation3.openBracket);
                    break;
                case constants.optionsCodemirror.isClosedRightBracket:
                    resultOptions[constants.optionsCodemirror.isClosedRightBracket] = this.codemirror
                        .getLine(cursor.line)
                        .slice(cursor.ch, valueLine.length)
                        .includes(constants.activeSymbolNotation3.closeBracket);
                    break;
                case constants.optionsCodemirror.isIntoBracket:
                    // eslint-disable-next-line no-case-declarations
                    const isOpenedLeftBracket = this.codemirror
                        .getLine(cursor.line)
                        .slice(0, cursor.ch)
                        .includes(constants.activeSymbolNotation3.openBracket);
                    // eslint-disable-next-line no-case-declarations
                    const isClosedRightBracket = this.codemirror
                        .getLine(cursor.line)
                        .slice(cursor.ch, valueLine.length)
                        .includes(constants.activeSymbolNotation3.closeBracket);
                    resultOptions[constants.optionsCodemirror.isIntoBracket] = isOpenedLeftBracket && isClosedRightBracket;
                    break;
                case constants.optionsCodemirror.isIntoSquareBracket:
                    // eslint-disable-next-line no-case-declarations
                    const isOpenedSquareBracket = this.codemirror
                        .getLine(cursor.line)
                        .slice(0, cursor.ch)
                        .includes(constants.activeSymbolNotation3.openSquareBracket);
                    // eslint-disable-next-line no-case-declarations
                    const isClosedSquareBracket = this.codemirror
                        .getLine(cursor.line)
                        .slice(cursor.ch, valueLine.length)
                        .includes(constants.activeSymbolNotation3.closeSquareBracket);
                    resultOptions[constants.optionsCodemirror.isIntoSquareBracket] = isOpenedSquareBracket && isClosedSquareBracket;
                    break;
                case constants.optionsCodemirror.isEmptyLine:
                    resultOptions[constants.optionsCodemirror.isEmptyLine] = !valueLine.trim().length;
                    break;
                case constants.optionsCodemirror.previousSymbol:
                    resultOptions[constants.optionsCodemirror.previousSymbol] = valueLine[cursor.ch - 1];
                    break;
                case constants.optionsCodemirror.twoPreviousSymbol:
                    resultOptions[constants.optionsCodemirror.twoPreviousSymbol] = valueLine[cursor.ch - 2];
                    break;
                default:
                    break;
            }
        });
        return resultOptions;
    },

    __closeNotationMode() {
        codemirror.off('pick', this.changeTemplateNotation);
        codemirror.off('select', this.showTooltipNotation);
        codemirror.off('select', this.showTooltipPrefixN3);
    },

    async __setFunctionsHintForExpression() {
        if (!this.codemirror) {
            return;
        }
        const ontologyObjectsLength = this.codemirror.getMode()?.ontologyObjects.length;
        if (!this.options.ontologyService || ontologyObjectsLength) {
            return;
        }
        if (this.autoCompleteModel?.get(constants.autoCompleteContext.functions)) {
            this.codemirror.getMode().ontologyObjects = this.autoCompleteModel.get(constants.autoCompleteContext.functions);
            return;
        }
        this.autoCompleteModel = new Backbone.Model();
        this.templateId = this.options.templateId;
        const ontologyModel = await this.options.ontologyService.getFunctions();
        const functionsExpression = constants.autoCompleteContext.functions;
        if (ontologyModel.functions) {
            this.autoCompleteModel.set({ functions: MappingService.mapOntologyArrayToAutoCompleteArray(ontologyModel.functions, functionsExpression) });
            this.codemirror.getMode().ontologyObjects = this.autoCompleteModel.get(constants.autoCompleteContext.functions);
        }
    },

    __closeCSharpMode() {
        codemirror.off('select', this.showTooltipCSharp);
        codemirror.off('pick', this.cleanCSharpInfoList);
    },

    __noSuggestionHint() {
        let autoCompleteObject = {};
        const cursor = this.codemirror.getCursor();
        autoCompleteObject = {
            from: {
                line: cursor.line,
                ch: cursor.ch
            },
            to: {
                line: cursor.line,
                ch: cursor.ch
            },
            list: [
                {
                    text: '',
                    displayText: LocalizationService.get('CORE.FORM.EDITORS.CODE.NOSUGGESTIONS')
                }
            ]
        };
        return autoCompleteObject;
    },

    __find() {
        this.codemirror.execCommand('find');
    },

    __getScriptType() {
        switch (this.options.mode) {
            case constants.mode.script:
                return constants.typeScript.script;
            case constants.mode.notation3:
                return constants.typeScript.notation3;
            case constants.mode.expression:
                return constants.typeScript.expression;
            default:
                break;
        }
    },

    async __compile() {
        if (!this.intelliAssist) {
            return;
        }
        if (this.currentHighlightedLine) {
            this.codemirror.removeLineClass(this.currentHighlightedLine, 'background', constants.classes.colorError);
            this.codemirror.removeLineClass(this.currentHighlightedLine, 'background', constants.classes.colorWarning);
        }
        if (!this.codemirror.getValue()) {
            return;
        }

        const ERROR = 'Error';
        const WARNING = 'Warning';

        const newArrErr = [];
        const newArrWarn = [];
        const newArrInfo = [];

        const userCompileQuery = {
            sourceCode: this.codemirror.getValue(),
            sourceType: this.__getScriptType(),
            useOntologyLibriary: this.options.config?.useOntologyLibriary
        };
        if (this.options.mode === constants.mode.expression) {
            userCompileQuery.container = this.options.templateId;
        }
        const content = this.codemirror.getValue();
        this.setLoading(true);
        try {
            const ontologyModel = await this.intelliAssist.getCompile(userCompileQuery);

            if (ontologyModel.get('compilerRemarks').length > 0) {
                ontologyModel.get('compilerRemarks').forEach(el => {
                    const offsetStart = el.offsetStart;
                    if (el.offsetStart != null && content.length >= offsetStart) {
                        const obj = this.__countLineAndColumn(offsetStart, content);
                        el.line = obj.line;
                        el.column = obj.column;
                        switch (el.severity) {
                            case ERROR:
                                newArrErr.push(el);
                                break;
                            case WARNING:
                                newArrWarn.push(el);
                                break;
                            default:
                                newArrInfo.push(el);
                                break;
                        }
                    }
                });
            } else if (!this.isHideCompileMessage) {
                Core.ToastNotifications.add(Localizer.get('CORE.FORM.EDITORS.CODE.SUCCESSFULCOMPILE'));
            }

            const outputObj = {
                errors: newArrErr,
                warnings: newArrWarn,
                info: newArrInfo
            };
            this.trigger('compile', outputObj);
        } finally {
            this.setLoading(false);
        }
    },

    __jumpToLine(i) {
        const t = this.codemirror.charCoords({ line: i, ch: 0 }, 'local').top;
        const middleHeight = this.codemirror.getScrollerElement().offsetHeight / 2;
        this.codemirror.scrollTo(null, t - middleHeight - 5);
    },

    async __format() {
        if (this.codemirror.isReadOnly()) {
            return;
        }
        if (this.options.mode === constants.mode.expression) {
            const cm = this.codemirror;
            cm.execCommand('selectAll');
            const from = cm.getCursor(true);
            const to = cm.getCursor(false);
            const mode = cm.getMode();
            const text = cm.getRange(from, to).split('\n');
            const state = cm.getTokenAt(from).state;
            const indentUnit = cm.getOption('indentUnit');

            let out = '';
            let lines = 0;
            let atStartOfLine = from.ch === 0;

            const newline = () => {
                out += '\n';
                atStartOfLine = true;
                lines += 1;
            };

            for (let i = 0; i < text.length; i += 1) {
                const stream = new codemirror.StringStream(text[i], indentUnit);
                while (!stream.eol()) {
                    const style = mode.token(stream, state);
                    const cur = stream.current();
                    const cursor = cm.getCursor();
                    const next = cm.getTokenAt({ line: cursor.line, ch: cursor.char + 1 });
                    stream.start = stream.pos;
                    if (!atStartOfLine || /\S/.test(cur)) {
                        out += cur;
                        atStartOfLine = false;
                    }
                    if (!atStartOfLine && mode.newlineAfterToken && mode.newlineAfterToken(style, cur, next, stream.string.slice(stream.pos) || text[i + 1] || '', mode.state)) {
                        newline();
                    }
                }
                if (!stream.pos && mode.blankLine) mode.blankLine(state);
                if (!atStartOfLine) newline();
            }

            cm.operation(() => {
                cm.replaceRange(out, from, to);
                for (let cur = from.line + 1, end = from.line + lines; cur <= end; cur += 1) {
                    cm.indentLine(cur, 'smart');
                }
            });
        }
        if (this.options.mode === constants.mode.script) {
            const formatQuery = {
                SourceCode: this.codemirror.getValue(),
                SourceType: constants.typeScript.script,
                UseOntologyLibriary: this.options.config?.useOntologyLibriary
            };
            if (this.intelliAssist) {
                this.setLoading(true);
                try {
                    const ontologyModel = await this.intelliAssist.getFormatCSharp(formatQuery);
                    this.codemirror.setValue(ontologyModel.get('sourceCode'));
                } finally {
                    this.setLoading(false);
                }
            }
        }
    },

    async __cmwHint() {
        const completeHoverQuery = {
            sourceCode: this.codemirror.getValue(),
            cursorOffset: this.__countOffset(),
            sourceType: constants.typeScript.expression,
            queryCompleteHoverType: constants.queryCompleteHoverType.completion,
            useOntologyLibriary: false,
            solution: this.options.solution
        };

        let autoCompleteObject = {};

        const cursor = this.codemirror.getCursor();
        const token = this.codemirror.getTokenAt(cursor);

        if (this.options.getTemplate) {
            this.templateId = this.options.getTemplate();
        }
        const options = {
            token,
            types,
            cursor,
            autoCompleteModel: this.autoCompleteModel,
            completeHoverQuery,
            intelliAssist: this.intelliAssist,
            codemirror: this.codemirror,

            attributes: this.options.hintAttributes,
            templateId: this.options.templateId || this.templateId,
        };

        autoCompleteObject = await CmwCodeAssistantServices.getAutoCompleteObject(options);
        if (autoCompleteObject.list) {
            this.__renderConfigListToolbar(autoCompleteObject.list);
        }
        this.autoCompleteContext = CmwCodeAssistantServices.getAutoCompleteContext();
        this.showTooltipCMW = this.__showTooltip;
        codemirror.on(autoCompleteObject, 'select', this.showTooltipCMW);
        this.hintIsShown = true;

        return autoCompleteObject;
    },

    async __showHintsN3_ctr_space() {
        this.__resetN3Hints();
        const templateNotation3 = this.intelliAssist.getTemplateNotation3(this.options.solution);
        const { valueLine, column, token, cursor, isIntoBracket, isIntoSquareBracket, isEmptyLine, previousSymbol, twoPeviousSymbol } = this.__getOptionCodemirror([
            constants.optionsCodemirror.valueLine,
            constants.optionsCodemirror.column,
            constants.optionsCodemirror.cursor,
            constants.optionsCodemirror.isIntoBracket,
            constants.optionsCodemirror.isIntoSquareBracket,
            constants.optionsCodemirror.isEmptyLine,
            constants.optionsCodemirror.previousSymbol,
            constants.optionsCodemirror.twoPeviousSymbol,
            constants.optionsCodemirror.token
        ]);
        this.numberLineCallHints = this.codemirror.getCursor().line;
        const hasOnlyOneSymbol = valueLine.trim().length === 1;
        switch (previousSymbol) {
            case constants.activeSymbolNotation3.questionMark:
                if (hasOnlyOneSymbol || twoPeviousSymbol === ' ') {
                    await this.__setVariablesN3ForHint();
                }
                break;
            case constants.activeSymbolNotation3.at:
                if (hasOnlyOneSymbol || twoPeviousSymbol === ' ') {
                    return this.__getPrefixN3();
                }
                break;
            case constants.activeSymbolNotation3.colon:
                this.attributesN3 = null;
                return this.__getAttributeN3();
            default:
                break;
        }
        if (isEmptyLine) {
            this.hintsNotation3 = null;
            this.notation3Attributes = null;
            const hints = templateNotation3;
            return this.__showHintsIntoBracket({ cursor, column, token, hintsNotation3: hints, isIntoBracket: false });
        }
        const attributesN3 = await this.__getAttributeNotation3();
        if (!attributesN3) {
            return this.__noSuggestionHint();
        }
        if (isIntoBracket || isIntoSquareBracket) {
            this.hintsN3intoBracket = attributesN3;
        }
        this.hintsNotation3 = attributesN3;
        return this.__showHintsIntoBracket({ cursor, column, token, hintsNotation3: attributesN3, isIntoBracket, isIntoSquareBracket });
    },

    __showOtherHintsN3() {
        this.numberLineCallHints = this.codemirror.getCursor().line;
        const { cursor, column, numberLine, token, isIntoBracket, isIntoSquareBracket } = this.__getOptionCodemirror([
            constants.optionsCodemirror.cursor,
            constants.optionsCodemirror.token,
            constants.optionsCodemirror.column,
            constants.optionsCodemirror.numberLine,
            constants.optionsCodemirror.isIntoBracket,
            constants.optionsCodemirror.isIntoSquareBracket
        ]);
        if (this.hintsN3intoBracket && (isIntoBracket || isIntoSquareBracket)) {
            const hints = this.filterHintsNotation3 || this.hintsN3intoBracket;
            const autoCompleteObject = this.__mapFormatHintsN3(numberLine, column, hints, token);
            this.changeTemplateNotation = this.__changeTemplate;
            codemirror.on(autoCompleteObject, 'pick', descriptionHint => this.changeTemplateNotation(descriptionHint, cursor, isIntoSquareBracket));
            this.__renderConfigListToolbar(this.hintsN3intoBracket);
            this.showTooltipNotation = this.__showTooltip;
            codemirror.on(autoCompleteObject, 'select', this.showTooltipNotation);
            return autoCompleteObject;
        }
    },

    __showHintsIntoBracket(options) {
        const { cursor, column, hintsNotation3, token, isIntoBracket, isIntoSquareBracket } = options;
        const ch = column;
        const autoCompleteObject = this.__mapFormatHintsN3(cursor.line, ch, hintsNotation3, token);
        if (isIntoBracket || isIntoSquareBracket) {
            if (token.string.includes(' ')) {
                autoCompleteObject.from.ch += 1;
            }
            this.changeTemplateNotation = this.__changeTemplate;
            codemirror.on(autoCompleteObject, 'pick', descriptionHint => this.changeTemplateNotation(descriptionHint, cursor, isIntoSquareBracket));
        }
        this.__renderConfigListToolbar(hintsNotation3);
        this.showTooltipNotation = this.__showTooltip;
        codemirror.on(autoCompleteObject, 'select', this.showTooltipNotation);
        return autoCompleteObject;
    },

    __mapFormatHintsN3(line, ch, list, token) {
        const { isEmptyLine } = this.__getOptionCodemirror([constants.optionsCodemirror.isEmptyLine, constants.optionsCodemirror.isIntoBracket]);
        const isSpecialLeftSymbol = [constants.activeSymbolNotation3.colon, constants.activeSymbolNotation3.openBracket].includes(token.string);
        const isEndsWithQuotationMark = token.string.slice(-1) === '"';
        return {
            from: {
                line,
                ch: isEmptyLine || isSpecialLeftSymbol || isEndsWithQuotationMark ? ch : token.start
            },
            to: {
                line,
                ch: token.end
            },
            list
        };
    },

    __changeTemplate(descriptionHint, cursor, isIntoSquareBracket) {
        const numberLine = this.codemirror.getCursor().line;
        const valueLine = this.codemirror.getLine(numberLine);
        const startSpaces = valueLine.match(/\s+/) ? valueLine.match(/\s+/)[0] : '';
        let newValueLine;
        if (isIntoSquareBracket) {
            newValueLine = `${startSpaces}?object${descriptionHint.name} a [object:alias ${descriptionHint.text}].`;
            this.codemirror.replaceRange(newValueLine, { line: numberLine, ch: 0 }, { line: numberLine });
            return;
        }
        if (descriptionHint.overloads && descriptionHint.overloads.length) {
            let paramGlobalFunction = '';
            descriptionHint.overloads.forEach(overload => {
                paramGlobalFunction += `("${overload.name}" val) `;
            });
            newValueLine = `${startSpaces}("${this.options.solution}" "${descriptionHint.name}" (${paramGlobalFunction})) cmwglobal:callGlobalFunction ?callResult.`;
            this.codemirror.replaceRange(newValueLine, { line: numberLine, ch: 0 }, { line: numberLine });
        } else {
            let newNameProperty;
            const regExpFindPropName = /\?pro\w*/i;
            const searchRegExp = valueLine.match(regExpFindPropName);
            const nameOldProperty = searchRegExp && searchRegExp[0];
            if (nameOldProperty && descriptionHint.name) {
                const addName = `${descriptionHint.name[0].toUpperCase()}${descriptionHint.name.slice(1)}`;
                newNameProperty = `${nameOldProperty}${addName}`;
                newValueLine = valueLine.replace(regExpFindPropName, newNameProperty);
                this.codemirror.replaceRange(newValueLine, { line: numberLine, ch: 0 }, { line: numberLine });
                this.codemirror.setCursor({ line: cursor.line, ch: cursor.ch + descriptionHint.text.length });
            }
        }
    },

    async __getAttributeNotation3() {
        this.setLoading(true);
        try {
            const completeHoverQuery = {
                sourceCode: this.codemirror.getValue(),
                cursorOffset: this.__countOffset(),
                sourceType: constants.typeScript.notation3,
                queryCompleteHoverType: constants.queryCompleteHoverType.completion,
                useOntologyLibriary: false,
                solution: this.options.solution
            };
            const notation3Attributes = await this.intelliAssist.getNotation3Attribute(completeHoverQuery);
            if (notation3Attributes) {
                return notation3Attributes;
            }
        } finally {
            this.setLoading(false);
        }
    },

    __getLocalVariablesN3() {
        this.numberLineCallHints = this.codemirror.getCursor().line;
        const cursor = this.codemirror.getCursor();
        const token = this.codemirror.getTokenAt(cursor);
        const hintsNotation = this.filterVariabletN3 || this.listVariablesHintsNotation3;
        if (!hintsNotation.length) {
            return this.__noSuggestionHint();
        }
        this.__renderConfigListToolbar(hintsNotation);
        return this.__mapFormatHintsN3(cursor.line, cursor.ch, hintsNotation, token);
    },

    __hideTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    },

    __onKeyDown(editor, event) {
        const charCode = event.which === null ? event.keyCode : event.which;
        this.isExternalChange = !(
            !event.altKey
            && !event.ctrlKey
            && !event.metaKey
            && (charCode === keyCode['>']
                || charCode === keyCode.HOME
                || (charCode >= keyCode[0] && charCode <= keyCode.Z)
                || (charCode > keyCode._ && charCode < keyCode['{'])
                || charCode === keyCode.BACKSPACE
                || charCode === keyCode.PERIOD)
        );
        if (charCode === keyCode.ESCAPE && !this.hintIsShown) {
            if (!this.isDestroyed()) {
                this.minimize();
                event.stopPropagation();
            }
            return;
        }
        this.__change();
    },

    __onMouseover(e) {
        if (this.hintIsShown) {
            return;
        }

        const el = e.target;
        let text = el.innerHTML;

        if (text.charAt(0) === '"') {
            text = text.substr(1, text.length - 2);
        }

        if (!el || el.className === 'CodeMirror-search-hint') {
            this.__hideTooltip();
            return;
        }

        const obj = this.__findObjectByText(text);
        if (el.tagName.toLowerCase() === 'span' && obj) {
            const tooltipModel = new Backbone.Model(obj);
            const tooltipView = MappingService.getTooltipView(tooltipModel.get('type'));

            if (!tooltipView) {
                this.__hideTooltip();
                this.__highlightItem();
                return;
            }

            this.tooltip = new tooltipView({ model: tooltipModel });
            this.showChildView('tooltipContainer', this.tooltip);

            const documentWidth = document.body.offsetWidth;
            const documentHeight = document.body.offsetHeight;
            const tooltipWidth = this.tooltip.$el.width();
            const tooltipHeightWithPadding = this.tooltip.$el.height() + TOOLTIP_PADDING_PX;
            const x = e.pageX + tooltipWidth > documentWidth ? documentWidth - tooltipWidth : e.pageX;
            const y = e.pageY + tooltipHeightWithPadding > documentHeight ? e.pageY - tooltipHeightWithPadding : e.pageY + TOOLTIP_PADDING_PX;
            this.tooltip.setPosition({ top: y, left: x });
            this.__highlightItem(el);
        } else {
            this.__hideTooltip();
            this.__highlightItem();
        }
    },

    __onMouseleave() {
        if (!this.hintIsShown) {
            this.__hideTooltip();
        }
        this.__highlightItem();
    },

    __findObjectByText(text) {
        if (this.autoCompleteContext == null || !this.autoCompleteModel?.get(this.autoCompleteContext)) {
            return;
        }
        return this.autoCompleteModel.get(this.autoCompleteContext)?.find(item => item.text === text);
    },

    __highlightItem(el) {
        if (this.highlightedItem) {
            this.highlightedItem.classList.remove(classes.highlighted);
        }
        if (el) {
            this.highlightedItem = el;
            this.highlightedItem.classList.remove(classes.highlighted);
        }
    },

    __resetN3Hints() {
        this.filterVariabletN3 = null;
        this.filterListPrefixN3 = null;
        this.filterAttributesN3 = null;
        this.filterListPrefixN3 = null;
        this.filterHintsNotation3 = null;
    },

    __onTooltipPeek() {
        // eslint-disable-next-line no-undef
        const event = $.Event('keypdown');
        event.keyCode = 9;
        this.codemirror.triggerOnKeyDown(event);
        this.codemirror.focus();
    },

    __checkComments() {
        let totalChars = 0;
        let totalCommentsChars = 0;
        const content = this.codemirror.getValue();
        const lines = this.codemirror.lineCount();
        const contentArr = content.split('\n');
        if (content) {
            let i = 0;
            while (i < lines) {
                const commentCh = contentArr[i].indexOf('//');
                totalChars += contentArr[i].length;
                if (commentCh >= 0) {
                    totalCommentsChars = totalCommentsChars + contentArr[i].length - commentCh - '//'.length;
                }
                i++;
            }
        }
        return totalChars / totalCommentsChars <= 4;
    },

    setLoading(loading) {
        if (!this.isDestroyed()) {
            this.loading.setLoading(loading);
        }
    }
});
