
import template from 'text-loader!../templates/editorCanvas.html';
import core from 'comindware/core';
import PresentationItemView from './PresentationItemView';

export default Marionette.LayoutView.extend({
    initialize(options) {
        this.model = new Backbone.Model({
            editorMode: 'none'
        });
        this.view = options.view;
    },

    template: Handlebars.compile(template),

    ui: {
        editorRegion: '.js-editor-region',
        collapseButton: '.js-content-collapse'
    },

    regions: {
        editorRegion: '.js-editor-region',
        modelRegion: '.js-model-region',
        editorModeRegion: '.js-editor-mode-region'
    },

    modelEvents: {
        change: 'updateEditorModel'
    },

    onRender() {
        this.editorRegion.show(this.view);
        if (this.options.canvasWidth) {
            this.ui.editorRegion.css('width', this.options.canvasWidth);
        }

        let presentationView;
        if (this.options.presentation) {
            if (_.isString(this.options.presentation)) {
                presentationView = new PresentationItemView({
                    model: this.view.model,
                    template: Handlebars.compile(`<span style="vertical-align: top;">model[${this.view.key}]: </span><span>${this.options.presentation}</span>`)
                });
            } else {
                presentationView = new this.options.presentation({
                    model: this.view.model
                });
            }
            this.modelRegion.show(presentationView);
        }

        const editorModeView = new core.form.editors.RadioGroupEditor({
            model: this.model,
            key: 'editorMode',
            autocommit: true,
            radioOptions: [
                {
                    id: 'none',
                    displayText: 'Normal'
                },
                {
                    id: 'readonly',
                    displayText: 'Readonly'
                },
                {
                    id: 'disabled',
                    displayText: 'Disabled'
                }
            ]
        });
        this.editorModeRegion.show(editorModeView);
    },

    updateEditorModel() {
        const editorMode = this.model.get('editorMode');
        switch (editorMode) {
            case 'none':
                this.view.setEnabled(true);
                this.view.setReadonly(false);
                break;
            case 'disabled':
                this.view.setEnabled(false);
                this.view.setReadonly(false);
                break;
            case 'readonly':
                this.view.setEnabled(true);
                this.view.setReadonly(true);
                break;
            default:
                break;
        }
    },

    __toggleCollapse() {
        this.collapsed = !this.collapsed;
        this.$el.width(this.collapsed ? 40 : 250);
    }
});
