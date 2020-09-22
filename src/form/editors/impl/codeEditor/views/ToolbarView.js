import template from '../templates/toolbar.html';

export default Marionette.View.extend({
    initialize(options = {}) {
        this.isReadonly = options.isReadonly;
    },

    templateContext() {
        return {
            isReadonly: this.isReadonly
        };
    },

    className: 'dev-code-editor-toolbar',

    template: Handlebars.compile(template),

    ui: {
        compile: '.js-code-editor-compile',
        undo: '.js-code-editor-undo',
        redo: '.js-code-editor-redo',
        format: '.js-code-editor-format',
        hint: '.js-code-editor-hint',
        find: '.js-code-editor-find',
        maximize: '.js-code-editor-maximize',
        minimize: '.js-code-editor-minimize',
        download: '.js-code-editor-download',
        close: '.js-code-editor-close'
    },

    triggers: {
        'click @ui.compile': 'compile',
        'click @ui.undo': 'undo',
        'click @ui.redo': 'redo',
        'click @ui.format': 'format',
        'click @ui.hint': 'show:hint',
        'click @ui.find': 'find',
        'click @ui.download': 'download'
    },

    events: {
        'click @ui.maximize': '__onMaximize',
        'click @ui.minimize': '__onMinimize',
        'click @ui.close': '__onClose'
    },

    onAttach() {
        this.ui.minimize.hide();
    },

    maximize() {
        this.ui.close.show();
        this.ui.minimize.show();
        this.ui.maximize.hide();
    },

    minimize() {
        this.ui.close.hide();
        this.ui.maximize.show();
        this.ui.minimize.hide();
    },

    __onMaximize() {
        this.maximize();
        this.trigger('maximize');
    },

    __onMinimize() {
        this.minimize();
        this.trigger('minimize');
    },

    __onClose() {       
        this.trigger('code:editor:close');
        this.ui.minimize.hide();
        this.ui.maximize.show();
        this.ui.close.hide();
    }
});
