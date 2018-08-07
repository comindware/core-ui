import template from '../templates/simplifiedPanel.hbs';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor-region'
    },

    className: 'simplified-panel_container',

    onRender() {
        this.showChildView('editorRegion', new this.options.editorConstructor(Object.assign({ openOnRender: true }, this.options.editorConfig)));
    }
});
