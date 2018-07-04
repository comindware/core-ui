import template from '../templates/toolbar.html';

export default Marionette.View.extend({
    className: 'dev-code-editor-toolbar',

    template: Handlebars.compile(template),

    ui: {
        undo: '.js-code-editor-undo',
        redo: '.js-code-editor-redo',
        format: '.js-code-editor-format',
        hint: '.js-code-editor-hint',
        find: '.js-code-editor-find',
        maximize: '.js-code-editor-maximize',
        minimize: '.js-code-editor-minimize'
    },

    triggers: {
        'click @ui.undo': 'undo',
        'click @ui.redo': 'redo',
        'click @ui.format': 'format',
        'click @ui.hint': 'show:hint',
        'click @ui.find': 'find'
    },

    events: {
        'click @ui.maximize': '__onMaximize',
        'click @ui.minimize': '__onMinimize'
    },

    onAttach() {
        this.ui.minimize.hide();
    },

    maximize() {
        this.ui.maximize.hide();
        this.ui.minimize.show();
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
    }
});
