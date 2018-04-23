import template from '../../templates/saveAs.html';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor-region'
    },

    className: 'msg-popup',

    ui: {
        yesButton: '.js-button-yes',
        cancelButton: '.js-button-cancel'
    },

    events: {
        'click @ui.yesButton': '__accept',
        'click @ui.cancelButton': '__closePopup'
    },

    onRender() {
        const schema = {
            name: {
                title: Localizer.get('PROCESS.RECORDTYPES.CONTEXT.PROPERTY.NAME'),
                type: 'Text',
                required: true,
                autocommit: true,
                validators: ['required']
            },
            alias: {
                title: Localizer.get('PROCESS.RECORDTYPES.CONTEXT.PROPERTY.SYSTEMNAME'),
                type: 'Text',
                required: true,
                autocommit: true,
                validators: ['required']
            }
        };

        this.view = new Core.layout.Form({
            model: this.model,
            schema,
            content: new Core.layout.VerticalLayout({
                rows: [Core.layout.createFieldAnchor('name'), Core.layout.createFieldAnchor('alias')]
            })
        });

        this.getRegion('editorRegion').show(this.view);
    },

    __accept() {
        const error = this.view.form.validate();
        if (error) {
            return;
        }
        this.trigger('accept', this.model);
        this.__closePopup();
    },

    __closePopup() {
        Core.services.WindowService.closePopup();
    }
});
