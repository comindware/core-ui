import { codemirror } from 'lib';
import ToolbarView from './ToolbarView';
import OutputView from './OutputView';
import template from '../templates/codemirror.html';
import MappingService from '../services/MappingService';
import constants from '../Constants';
import LocalizationService from '../../../../../services/LocalizationService';
import GlobalEventService from '../../../../../services/GlobalEventService';
import LoadingBehavior from '../../../../../views/behaviors/LoadingBehavior';

const modes = {
    expression: 'text/comindware_expression',
    script: 'text/x-csharp'
};

const TOOLTIP_PADDING_PX = 15;
const TOOLTIP_MARGIN = 10;
const CHECK_VISIBILITY_DELAY = 200;

const classes = constants.classes;
const types = constants.types;

const lineSeparator = '\r\n';

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
        if (options.mode === 'expression') {
            this.autoCompleteArray = [];
            if (options.ontologyService) {
                options.ontologyService.getOntology().then(ontologyModel => {
                    this.autoCompleteArray = MappingService.mapOntologyModelToAutoCompleteArray(ontologyModel);
                    if (this.codemirror) {
                        this.codemirror.getMode().ontologyObjects = this.autoCompleteArray;
                        //retokenize codemirror with ontology model
                        this.setValue(this.getValue());
                    }
                });
            }
        }
        if (options.mode === 'script') {
            this.intelliAssist = options.ontologyService;
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
        if (this.options.mode === 'script' && this.options.showDebug !== false) {
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
            lineSeparator,
            mode: modes[this.options.mode],
            ontologyObjects: this.autoCompleteArray,
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
        if (this.options.mode === 'expression') {
            this.codemirror.getWrapperElement().onmouseover = this.__onMouseover;
            this.codemirror.getWrapperElement().onmouseleave = this.__onMouseleave;
        }
        this.codemirror.on('inputRead', (editor, change) => {
            if (this.intelliAssist) {
                if (change.text[0] === '.') {
                    this.__showCSharpHint();
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
        this.codemirror.setValue(value?.replace(/[^\r]\n/g, lineSeparator) || '');
        this.refresh();
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
        if ( !this.ui.hints.length) {
            return;
        }
        if (this.hintIsShown && !this.ui.hints.get(0).contains(target)) {
            this.__hideHint();
        }
    },

    __hideHint() {
        this.codemirror.showHint(''); //with that argument showHint actually hides instead
        this.hintIsShown = false;
    },

    __onMaximize() {
        this.el.classList.add(classes.maximized);
        this.ui.editor.css('height', '80%');

        document.querySelector(this.regions.editorOutputContainer.el).style.height = '30%';
        document.querySelector(this.regions.output).style.height = '100%';
        if (this.options.mode === 'script' && this.options.showDebug !== false) {
            document.querySelector(this.regions.outputTabs).style.height = '100%';
        }
        this.$el.appendTo('body');
        this.codemirror.refresh();
        this.codemirror.focus();
    },

    __onMinimize() {
        this.trigger('minimize', this);
        this.$el.appendTo(this.parentElement);
        this.el.classList.remove(classes.maximized);
        this.ui.editor.css('height', this.options.height);
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
        if (this.options.mode === 'expression') {
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
                SourceCode: this.codemirror.getValue(),
                CursorOffset: this.__countOffset(),
                SourceType: 'CSharp',
                QueryCompleteHoverType: 'Completion',
                UseOntologyLibriary: this.options.config.useOntologyLibriary
            };
            const ontologyModel = await this.intelliAssist.getCSharpOntology(completeHoverQuery);
            this.newArr = [];
            if (ontologyModel) {
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
            } else {
                this.CSharpInfoList = [];
            }
            this.codemirror.showHint({ hint: this.__getTooltipCsharpModel });
        } finally {
            this.setLoading(false);
        }
    },

    __getTooltipCsharpModel() {
        let autoCompleteObject = {};
        const cursor = this.codemirror.getCursor();
        const token = this.codemirror.getTokenAt(cursor);
        this.hintsBehindDot = this.codemirror.getLine(cursor.line)[token.start] === '.';
        if (!this.CSharpInfoList.length) {
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
                list: this.CSharpInfoList
            };
        }
        if (!this.hintsBehindDot) {
            if (this.previousHintName) {
                const indexBehhindHint = this.CSharpInfoList.findIndex(item => item.name === this.previousHintName);
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
        const hintPanel = hintEl.parentNode;
        const hintPanelPosition = hintPanel.getBoundingClientRect();
        const hintPanelWidth = hintPanelPosition.width;
        const codemirrorEditorWidth = hintPanel.parentElement.offsetWidth;
        const top = hintPanel.offsetTop;

        const half = codemirrorEditorWidth / 2;
        const isMoreHalf = (hintPanel.offsetLeft + hintPanelWidth) > half;

        let left;
        let right;

        if (isMoreHalf) {
            right = codemirrorEditorWidth - hintPanel.offsetLeft + TOOLTIP_MARGIN;
            left = TOOLTIP_MARGIN;
        } else {
            left = hintPanel.offsetLeft + hintPanelWidth + TOOLTIP_MARGIN;
            right = TOOLTIP_MARGIN;
        }
        return { top, left, right };
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
        if (this.options.mode === 'expression') {
            this.codemirror.showHint({ hint: this.__cmwHint });
        }
        if (this.options.mode === 'script') {
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
            SourceCode: this.codemirror.getValue(),
            SourceType: 'CSharp',
            UseOntologyLibriary: this.options.config?.useOntologyLibriary
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
        if (this.options.mode === 'expression') {
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
        if (this.options.mode === 'script') {
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

    __cmwHint() {
        const completion = [];
        let autoCompleteObject = {};
        const cursor = this.codemirror.getCursor();
        const token = this.codemirror.getTokenAt(cursor);
        if (token.type === 'identifier' || types[token.type]) {
            this.autoCompleteArray.forEach(item => {
                if (item.text.toLowerCase().indexOf(token.string.toLowerCase()) > -1) {
                    completion.push(item);
                }
            });
            autoCompleteObject = {
                from: {
                    line: cursor.line,
                    ch: token.start
                },
                to: {
                    line: cursor.line,
                    ch: token.end
                },
                list: completion
            };
        } else if (token.string === '$' || token.string === '->') {
            this.autoCompleteArray.forEach(item => {
                if (item.type === types.attribute) {
                    completion.push(item);
                }
                autoCompleteObject = {
                    from: cursor,
                    to: cursor,
                    list: completion
                };
            });
        } else if (token.string === '(' || this.codemirror.getValue().trim() === '') {
            autoCompleteObject = {
                from: cursor,
                to: cursor,
                list: this.autoCompleteArray
            };
        } else {
            autoCompleteObject = {
                from: cursor,
                to: cursor,
                list: completion
            };
        }

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
            && (charCode === 62 || charCode === 36 || (charCode > 64 && charCode < 91) || (charCode > 95 && charCode < 123) || charCode === 8)
        );
        if (charCode === 27 && !this.hintIsShown) {
            if (!this.isDestroyed()) {
                this.minimize();
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
        return this.autoCompleteArray.find(item => item.text === text);
    },

    __highlightItem(el) {
        if (this.highlightedItem) {
            this.highlightedItem.removeClass(classes.highlighted);
        }
        if (el) {
            this.highlightedItem = el;
            this.highlightedItem.addClass(classes.highlighted);
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
