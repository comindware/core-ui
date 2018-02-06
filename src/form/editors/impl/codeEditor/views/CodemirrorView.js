/**
 * Developer: Stanislav Guryev
 * Date: 02.02.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import { codemirror } from 'lib';
import ToolbarView from './ToolbarView';
import template from '../templates/codemirror.html';
import MappingService from '../services/MappingService';
import constants from '../Constants';

const modes = {
    expression: 'text/comindware_expression',
    script: 'text/x-csharp'
};

const TOOLTIP_PADDING_PX = 15;

const CHECK_VISIBILITY_DELAY = 200;

const classes = constants.classes;
const types = constants.types;

export default Marionette.View.extend({
    initialize(options = {}) {
        _.bindAll(this, '__onBlur', '__onChange', '__showHint', '__find', '__undo', '__redo', '__format', '__cmwHint',
            '__showTooltip', '__hideTooltip', '__onMouseover', '__onMouseleave', '__onKeyDown', '__onMinimize');
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
    },

    regions: {
        toolbarContainer: '.js-code-toolbar-container',
        tooltipContainer: '.js-code-tooltip-container',
        editorContainer: '.js-code-editor-container'
    },

    ui: {
        toolbar: '.js-code-toolbar-container',
        editor: '.js-code-editor-container'
    },

    template: Handlebars.compile(template),

    className: 'dev-codemirror',

    onRender() {
        this.toolbar = new ToolbarView({ maximized: this.options.maximized });
        this.toolbar.on('undo', this.__undo);
        this.toolbar.on('redo', this.__redo);
        this.toolbar.on('format', this.__format);
        this.toolbar.on('show:hint', this.__showHint);
        this.toolbar.on('find', this.__find);
        this.toolbar.on('maximize', () => {
            this.__onMaximize();
            this.trigger('maximize', this);
        });
        this.toolbar.on('minimize', this.__onMinimize);

        this.showChildView('toolbarContainer', this.toolbar);

        this.ui.editor.css('height', this.options.height);
        this.hintIsShown = false;

        const extraKeys = {
            'Ctrl-Space': this.__showHint,
            'Alt-F': this.__format
        };

        this.codemirror = codemirror(this.ui.editor[0], {
            extraKeys,
            lineNumbers: true,
            mode: modes[this.options.mode],
            ontologyObjects: this.autoCompleteArray,
            matchBrackets: true,
            autoCloseBrackets: true,
            styleActiveLine: true,
            lint: true,
            indentUnit: 4,
            foldGutter: true,
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
            $(this.codemirror.getWrapperElement()).bind('mouseover', this.__onMouseover);
            $(this.codemirror.getWrapperElement()).bind('mouseleave', this.__onMouseleave);
        }
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
        this.codemirror.setValue(value || '');
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

    setReadonly(readonly) {
        if (this.codemirror) {
            this.codemirror.setOption('readOnly', readonly);
        }
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

    __onMaximize() {
        this.$el.addClass(classes.maximized);
        this.ui.editor.css('height', '100%');
        this.codemirror.refresh();
        this.isMaximized = true;
    },

    __onMinimize() {
        this.trigger('minimize', this);
        this.$el.removeClass(classes.maximized);
        this.ui.editor.css('height', this.options.height);
        this.codemirror.refresh();
        this.isMaximized = false;
        this.__change();
    },

    __onBlur() {
        this.__change();
    },

    __change() {
        this.trigger('change', this);
    },

    __onChange() {
        if (!this.isExternalChange) {
            this.__showHint();
        }
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

    __showHint() {
        if (this.codemirror.isReadOnly()) {
            return;
        }
        this.hintIsShown = true;
        this.codemirror.showHint((this.options.mode === 'expression') ? { hint: this.__cmwHint } : null);
    },

    __find() {
        this.codemirror.execCommand('find');
    },

    __format() {
        if (this.codemirror.isReadOnly()) {
            return;
        }
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
                if (!atStartOfLine && mode.newlineAfterToken &&
                    mode.newlineAfterToken(style, cur, next, stream.string.slice(stream.pos) || text[i + 1] || '', mode.state)) {
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

    __showTooltip(token, hintEl) {
        $(hintEl).focus();
        const tooltipModel = new Backbone.Model(this.__findObjectByText(token.text));
        const tooltipView = MappingService.getTooltipView(tooltipModel.get('type'));
        if (!tooltipView) {
            this.__hideTooltip();
            return;
        }
        this.tooltip = new tooltipView({
            model: tooltipModel,
            isFull: true
        });
        this.listenTo(this.tooltip, 'syntax:changed', syntax => token.currentSyntax = syntax);
        this.listenTo(this.tooltip, 'peek', this.__onTooltipPeek);
        this.showChildView('tooltipContainer', this.tooltip);

        const tooltipMargin = 10;
        const hintPanel = $(hintEl).parent();
        const hintPanelPosition = hintPanel.position();
        const hintPanelWidth = hintPanel.width();
        const tooltipWidth = this.tooltip.$el.width();

        let left = hintPanelPosition.left + hintPanelWidth + tooltipMargin;
        if (left + tooltipWidth > window.innerWidth) {
            left = hintPanelPosition.left - tooltipWidth - tooltipMargin;
        }
        this.tooltip.setPosition({ top: hintPanelPosition.top, left });
    },

    __hideTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    },

    __onKeyDown(editor, event) {
        const charCode = event.which === null ? event.keyCode : event.which;
        this.isExternalChange = !((!event.altKey && !event.ctrlKey && !event.metaKey) &&
        (
            (charCode === 62) ||
            (charCode === 36) ||
            (charCode > 64 && charCode < 91) ||
            (charCode > 95 && charCode < 123) ||
            (charCode === 8)
        ));
    },

    __onMouseover(e) {
        if (this.hintIsShown) {
            return;
        }

        const el = $(e.target);
        let text = el.text();

        if (text.charAt(0) === '"') {
            text = text.substr(1, text.length - 2);
        }

        if (!el || el[0].className === 'CodeMirror-search-hint') {
            this.__hideTooltip();
            return;
        }

        const obj = this.__findObjectByText(text);
        if (el[0].tagName.toLowerCase() === 'span' && obj) {
            const tooltipModel = new Backbone.Model(obj);
            const tooltipView = MappingService.getTooltipView(tooltipModel.get('type'));

            if (!tooltipView) {
                this.__hideTooltip();
                this.__highlightItem();
                return;
            }

            this.tooltip = new tooltipView({ model: tooltipModel });
            this.tooltipContainer.show(this.tooltip);
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
        const event = $.Event('keypdown');
        event.keyCode = 9;
        this.codemirror.triggerOnKeyDown(event);
        this.codemirror.focus();
    }
});
