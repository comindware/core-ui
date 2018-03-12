import core from 'comindware/core';
import template from 'text-loader!../templates/demoProfilePanel.html';

export default Marionette.LayoutView.extend({
    className: 'nav-profile_test',

    regions: {
        dateEditorRegion: '.js-date-editor-region'
    },

    template: Handlebars.compile(template),

    onShow() {
        this.dateEditorRegion.show(new core.form.editors.DateTimeEditor());
    }
});
