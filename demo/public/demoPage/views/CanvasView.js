
import template from 'text-loader!../templates/editorCanvas.html';
import core from 'comindware/core';
import PresentationItemView from './PresentationItemView';

export default Marionette.View.extend({
    initialize(options) {
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

    onRender() {
        this.showChildView('editorRegion', this.view);

        if (this.options.canvasWidth) {
            this.ui.editorRegion.css('width', this.options.canvasWidth);
        }

        let presentationView;
        if (this.options.presentation) {
            if (typeof this.options.presentation === 'string') {
                presentationView = new PresentationItemView({
                    model: this.view.model,
                    template: Handlebars.compile(`<span style="vertical-align: top;">model[${this.view.key}]: </span><span>${this.options.presentation}</span>`)
                });
            } else {
                presentationView = new this.options.presentation({
                    model: this.view.model
                });
            }
            this.showChildView('modelRegion', presentationView);
        }

        if (this.getOption('isEditor')) {
            const editorModeView = new core.form.editors.RadioGroupEditor({
                value: 'none',
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
                    },
                    {
                        id: 'hidden',
                        displayText: 'Hidden'
                    }
                ]
            });
            this.showChildView('editorModeRegion', editorModeView);
            this.listenTo(editorModeView, 'change', this.updateEditorModel);
        }
    },

    updateEditorModel(editor) {
        const editorMode = editor.getValue();
        switch (editorMode) {
            case 'none':
                this.view.setEnabled(true);
                this.view.setReadonly(false);
                this.view.setHidden(false);
                break;
            case 'disabled':
                this.view.setEnabled(false);
                this.view.setReadonly(false);
                this.view.setHidden(false);
                break;
            case 'readonly':
                this.view.setEnabled(true);
                this.view.setReadonly(true);
                this.view.setHidden(false);
                break;
            case 'hidden':
                this.view.setEnabled(true);
                this.view.setReadonly(false);
                this.view.setHidden(true);
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
