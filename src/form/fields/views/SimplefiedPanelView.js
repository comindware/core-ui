import template from '../templates/simplefiedPanel.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor-region'
    },

    class: 'simplefied-panel_container',

    onRender() {
        this.showChildView('editorRegion', this.options.editor);
    }
});
