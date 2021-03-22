import template from '../templates/toolbar.html';
import meta from '../Constants';

export default Marionette.View.extend({
    className: 'dev-code-editor-toolbar',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            isCSharpScript: this.options.mode === meta.mode.script
        };
    },

    ui: {
        compile: '.js-code-editor-compile',
        undo: '.js-code-editor-undo',
        redo: '.js-code-editor-redo',
        format: '.js-code-editor-format',
        find: '.js-code-editor-find',
        maximize: '.js-code-editor-maximize',
        minimize: '.js-code-editor-minimize',
        download: '.js-code-editor-download',
        close: '.js-code-editor-close',
        save: '.js-code-editor-save'
    },

    triggers: {
        'click @ui.compile': 'compile',
        'click @ui.undo': 'undo',
        'click @ui.redo': 'redo',
        'click @ui.format': 'format',
        'click @ui.find': 'find',
        'click @ui.download': 'download',
        'click @ui.save': 'save'
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
        if (this.options.showMode === meta.showModes.button) {
            this.ui.maximize.hide();
            this.ui.minimize.hide();
            this.ui.save.show();
            this.ui.close.show();
        } else {
            this.ui.save.hide();
            this.ui.close.hide();
            this.ui.maximize.hide();
            this.ui.minimize.show();
        }
    },

    minimize() {
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
    },

    toggleToolbar(readonly) {
        this.ui.compile.toggle(!readonly);
        this.ui.undo.toggle(!readonly);
        this.ui.redo.toggle(!readonly);
        this.ui.format.toggle(!readonly);
    }
});
