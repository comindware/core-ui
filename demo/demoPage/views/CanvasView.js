import template from 'text-loader!../templates/editorCanvas.html';
import PresentationItemView from './PresentationItemView';

export default Marionette.View.extend({
    initialize(options) {
        this.view = options.view;
    },

    template: Handlebars.compile(template),

    className: 'editor_container',

    ui: {
        editorRegion: '.js-editor-region',
        collapseButton: '.js-content-collapse'
    },

    regions: {
        editorRegion: {
            el: '.js-editor-region',
            replaceElement: true
        },
        modelRegion: '.js-model-region',
        editorModeRegion: '.js-editor-mode-region',
        formatSelectionRegion: '.js-format-selection-region'
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
            const editorModeView = new Core.form.editors.RadioGroupEditor({
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
            this.listenTo(editorModeView, 'change', this.__updateEditorModel);
        } else {
            this.ui.editorRegion.addClass('canvas-wrap');
        }

        if (this.getOption('showFormat')) {
            const formatSelectionView = new Core.form.editors.DatalistEditor({
                maxQuantitySelected: 1,
                collection: new Backbone.Collection(this.getOption('formats'))
            });
            this.showChildView('formatSelectionRegion', formatSelectionView);
            this.listenTo(formatSelectionView, 'change', () => this.__updateEditorFormat(formatSelectionView));
        }
    },

    __updateEditorModel(editor) {
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

    __updateEditorFormat(formatSelectionView) {
        this.view.setFormat && this.view.setFormat(formatSelectionView.getValue());
    },

    __toggleCollapse() {
        this.collapsed = !this.collapsed;
        this.$el.width(this.collapsed ? 40 : 250);
    }
});
