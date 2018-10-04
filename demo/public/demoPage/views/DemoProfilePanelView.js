import template from 'text-loader!../templates/demoProfilePanel.html';

export default Marionette.View.extend({
    className: 'nav-profile_test',

    regions: {
        dateEditorRegion: '.js-date-editor-region'
    },

    template: Handlebars.compile(template),

    onRender() {
        this.showChildView('dateEditorRegion', new Core.form.editors.DateTimeEditor());
    }
});
