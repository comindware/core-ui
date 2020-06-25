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

const modes = {
    expression: 'text/comindware_expression',
    script: 'text/x-csharp'
};

const TOOLTIP_PADDING_PX = 15;
const TOOLTIP_MARGIN = 10;
const CHECK_VISIBILITY_DELAY = 200;

const classes = constants.classes;
const types = constants.types;

const lineSeparatorLF = '\n';

export default Marionette.View.extend({
    initialize(options = {}) {
        this.tt = new Backbone.Model();
        _.bindAll(
            this,
            '__onBlur',
            '__onChange',
            '__showHint',
            '__find',
            '__undo',
            '__redo',
            '__format',
            '__cmwHint',
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
            '__getTooltipCsharpModel'
        );
        if (options.mode === constants.mode.expression) {
            this.autoCompleteModel = new Backbone.Model();
            this.autoCompleteContext = constants.autoCompleteContext.functions;
            if (options.ontologyService) {
                this.templateId = options.templateId;
                options.ontologyService.getFunctions().then(ontologyModel => {
                    if (ontologyModel.functions && constants.autoCompleteContext?.functions) {
                        this.autoCompleteModel.set({ functions: MappingService.mapOntologyArrayToAutoCompleteArray(ontologyModel.functions, constants.autoCompleteContext.functions) });
                        if (this.codemirror) {
                            this.codemirror.getMode().ontologyObjects = this.autoCompleteModel.get(constants.autoCompleteContext.functions);
                            this.setValue(this.getValue());
                        }
                    }
                });
            }
        }
        this.elementLength = 0;
        this.intelliAssist = options.ontologyService;
        if (options.mode === constants.mode.script) {
            codemirror.hintWords['text/x-csharp'] = [];
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

    onRender() {
        this.toolbar = new ToolbarView({ maximized: this.options.maximized, editor: this });
        this.toolbar.on('undo', this.__undo);
        this.toolbar.on('redo', this.__redo);
        this.toolbar.on('format', this.__format);
        this.toolbar.on('show:hint', this.__showHint);
        this.toolbar.on('find', this.__find);
        this.toolbar.on('compile', this.__compile);
        this.toolbar.on('maximize', () => {
            this.__onMaximize();
            this.trigger('maximize', this);
        });
        this.toolbar.on('minimize', this.__onMinimize);
        this.listenTo(GlobalEventService, 'window:mousedown:captured', this.__hideHintOnClick);
        this.showChildView('toolbarContainer', this.toolbar);
        if (this.options.mode === constants.mode.script && this.options.showDebug !== false) {
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
            'Ctrl-Space': this.__showHint,
            'Alt-F': this.__format
        };

        this.codemirror = codemirror(this.ui.editor[0], {
            extraKeys,
            lineNumbers: true,
            mode: modes[this.options.mode],
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
        this.codemirror.on('change', this.__onChange);
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
        this.codemirror.on('inputRead', (editor, change) => {
            if (this.intelliAssist) {
                if (change.text[0] === '.') {
                    this.filterList = null;
                    this.__showCSharpHint();
                } else if (this.CSharpInfoList && this.CSharpInfoList.length) {
                    const nameEntity = this.__getObjectNameEntity();
                    if (nameEntity && nameEntity.length) {
                        this.__showFilterCSharpHint(nameEntity);
                    } else {
                        this.filterList = null;
                    }
                }
            }
        });

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
    },

    onDestroy() {
        if (this.refreshTimerId) {
            clearTimeout(this.refreshTimerId);
        }
    },

    getValue() {
        return this.codemirror.getValue();
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
        }
    },

    onAttach() {
        this.parentElement = this.el.parentElement;
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
        this.el.classList.add(classes.maximized);
        this.popupId = WindowService.showElInPopup(this.$el, {
            immimmediateClosing: true,
            useWrapper: false
        });
        this.codemirror.refresh();
        this.codemirror.focus();
    },

    __onMinimize() {
        this.trigger('minimize', this);
        WindowService.closeElPopup(this.popupId, true);
        this.el.classList.remove(classes.maximized);
        this.codemirror.refresh();
        this.__change();
    },

    __onBlur() {
        this.__change();
    },

    __change() {
        this.trigger('change', this);
    },

    __onChange() {
        if (this.isExternalChange) {
            this.isExternalChange = false;
            return;
        }
        if (this.options.mode === constants.mode.expression) {
            this.__showHint();
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

    async __showCSharpHint() {
        if (!this.intelliAssist) {
            return;
        }
        this.setLoading(true);
        try {
            const completeHoverQuery = {
                sourceCode: this.codemirror.getValue(),
                cursorOffset: this.__countOffset(),
                sourceType: 'CSharp',
                queryCompleteHoverType: 'Completion',
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

    __renderConfigListToolbar(list) {
        list.forEach(item => {
            item.render = function(el, cm, data) {
                const icon = document.createElement('i');
                const text = document.createElement('span');
                const nameIcon = data.icons || data.type;
                const getIcon = getIconPrefixer(nameIcon);
                icon.className = getIcon(nameIcon);
                text.innerText = data.text;
                el.appendChild(icon);
                el.appendChild(text);
            };
        });
        return list;
    },

    __showFilterCSharpHint(nameEntity) {
        if (nameEntity && nameEntity.match(/\s/g) === null) {
            const regExpString = `^${nameEntity}`;
            const re = new RegExp(regExpString, 'ig');
            this.filterList = this.CSharpInfoList.filter(item => item.name.match(re) !== null);
            this.codemirror.showHint({ hint: this.__getTooltipCsharpModel });
        }
    },

    __getObjectNameEntity() {
        const lineNumber = this.codemirror.getCursor().line;
        const line = this.codemirror.getLine(lineNumber);
        const isFullStop = line.match(/\./g);
        if (lineNumber !== this.line) {
            this.filterList = null;
            return;
        }
        if (isFullStop) {
            let ch = this.codemirror.getCursor().ch;
            const arraySymbol = [];
            while (line[ch] !== '.') {
                arraySymbol.push(line[ch]);
                ch--;
            }
            const nameEntity = arraySymbol.reverse().join('');
            return nameEntity;
        }
    },

    __getTooltipCsharpModel() {
        let autoCompleteObject = {};
        const dataList = this.filterList || this.CSharpInfoList;
        const cursor = this.codemirror.getCursor();
        const token = this.codemirror.getTokenAt(cursor);
        this.hintsBehindDot = this.codemirror.getLine(cursor.line)[token.start] === '.';
        if (!dataList.length) {
            autoCompleteObject = {
                from: cursor,
                to: cursor,
                list: [{ text: LocalizationService.get('CORE.FORM.EDITORS.CODE.NOSUGGESTIONS') }]
            };
        } else {
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
        }
        if (!this.hintsBehindDot) {
            if (this.previousHintName) {
                const indexBehhindHint = dataList.findIndex(item => item.name === this.previousHintName);
                if (indexBehhindHint >= 0) {
                    autoCompleteObject.selectedHint = indexBehhindHint;
                }
            }
        } else {
            this.previousHintName = null;
        }
        codemirror.on(autoCompleteObject, 'select', this.__showTooltip);
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
        const tooltipTypeCSharp = constants.types.function;
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
            default:
                break;
        }
        const TooltipView = MappingService.getTooltipView(tooltipTypeCSharp);
        this.tooltip = new TooltipView(options);

        this.listenTo(this.tooltip, 'syntax:changed', syntax => (token.currentSyntax = syntax));
        this.listenTo(this.tooltip, 'peek', this.__onTooltipPeek);

        this.showChildView('tooltipContainer', this.tooltip);
        this.tooltip.setPosition(this.__getPositionTooltip(hintEl));
    },

    __showHint() {
        if (this.codemirror.isReadOnly()) {
            return;
        }
        this.hintIsShown = true;
        if (this.options.mode === constants.mode.expression) {
            this.codemirror.showHint({ hint: this.__cmwHint });
        }
        if (this.options.mode === constants.mode.script) {
            this.__showCSharpHint();
        }
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
    async __compile() {
        if (!this.intelliAssist) {
            return;
        }
        if (this.currentHighlightedLine) {
            this.codemirror.removeLineClass(this.currentHighlightedLine, 'background', 'dev-code-editor-error');
            this.codemirror.removeLineClass(this.currentHighlightedLine, 'background', 'dev-code-editor-warning');
        }

        const ERROR = 'Error';
        const WARNING = 'Warning';

        let newArrErr = [];
        let newArrWarn = [];
        let newArrInfo = [];

        const userCompileQuery = {
            sourceCode: this.codemirror.getValue(),
            sourceType: 'CSharp',
            useOntologyLibriary: this.options.config?.useOntologyLibriary
        };
        const content = this.codemirror.getValue();
        this.setLoading(true);
        try {
            const ontologyModel = await this.intelliAssist.getCompile(userCompileQuery);
            if (ontologyModel) {
                if (ontologyModel.get('compilerRemarks').length > 0) {
                    ontologyModel.get('compilerRemarks').forEach(el => {
                        const offsetStart = el.offsetStart;
                        if ((el.offsetStart != null) && (content.length >= offsetStart)) {
                            const obj = this.__countLineAndColumn(offsetStart, content);
                            el.line = obj.line;
                            el.column = obj.column;
                            switch (el.severity) {
                                case ERROR:
                                    newArrErr = newArrErr.concat([el]);
                                    break;
                                case WARNING:
                                    newArrWarn = newArrWarn.concat([el]);
                                    break;
                                default:
                                    newArrInfo = newArrInfo.concat([el]);
                                    break;
                            }
                        }
                    });
                } else {
                    Core.ToastNotifications.add(Localizer.get('CORE.FORM.EDITORS.CODE.SUCCESSFULCOMPILE'));
                }
            } else {
                newArrErr = [];
                newArrWarn = [];
                newArrInfo = [];
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
                SourceType: 'CSharp',
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
            sourceType: constants.mode.expression,
            queryCompleteHoverType: constants.queryCompleteHoverType.completion,
            useOntologyLibriary: false
        };

        let autoCompleteObject = {};

        const cursor = this.codemirror.getCursor();
        const token = this.codemirror.getTokenAt(cursor);

        const options = {
            token,
            types,
            cursor,
            autoCompleteModel: this.autoCompleteModel,
            completeHoverQuery,
            intelliAssist: this.intelliAssist,
            codemirror: this.codemirror,
            templateId: this.templateId,
        };

        autoCompleteObject = await CmwCodeAssistantServices.getAutoCompleteObject(options);
        if (autoCompleteObject.list) {
            this.__renderConfigListToolbar(autoCompleteObject.list);
        }
        this.autoCompleteContext = CmwCodeAssistantServices.getAutoCompleteContext();
        codemirror.on(autoCompleteObject, 'select', this.__showTooltip);
        this.hintIsShown = true;

        return autoCompleteObject;
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
            && (charCode === keyCode['>'] || charCode === keyCode.HOME || (charCode >= keyCode[0] && charCode <= keyCode.Z) || (charCode > keyCode._ && charCode < keyCode['{']) || charCode === keyCode.BACKSPACE || charCode === keyCode.PERIOD)
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
        if (this.autoCompleteContext === null) {
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
