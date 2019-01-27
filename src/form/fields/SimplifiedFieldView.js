// @flow
import template from './templates/simplifiedField.hbs';
import dropdown from 'dropdown';
import ErrorButtonView from './views/ErrorButtonView';
import InfoButtonView from './views/InfoButtonView';
import TooltipPanelView from './views/TooltipPanelView';
import ErrosPanelView from './views/ErrosPanelView';
import formRepository from '../formRepository';
import SimplifiedButtonView from './views/SimplifiedButtonView';
import SimplifiedPanelView from './views/SimplifiedPanelView';
import FieldView from './FieldView';

const classes = {
    REQUIRED: 'required',
    READONLY: 'readonly',
    DISABLED: 'disabled',
    ERROR: 'error'
};

export default FieldView.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: {
            el: '.js-editor-region',
            replaceElement: true
        },
        errorTextRegion: '.js-error-text-region',
        helpTextRegion: '.js-help-text-region'
    },

    onRender() {
        if (this.schema.helpText) {
            const viewModel = new Backbone.Model({
                helpText: this.schema.helpText,
                errorText: null
            });

            const infoPopout = dropdown.factory.createPopout({
                buttonView: InfoButtonView,
                panelView: TooltipPanelView,
                panelViewOptions: {
                    model: viewModel,
                    textAttribute: 'helpText'
                },
                popoutFlow: 'right',
                customAnchor: true
            });
            this.showChildView('helpTextRegion', infoPopout);
        }
        this.__showMenuView();
        this.setRequired(this.schema.required);
        this.__updateEditorState(this.schema.readonly, this.schema.enabled);
    },

    __showMenuView() {
        const menuView = Core.dropdown.factory.createDropdown({
            buttonView: SimplifiedButtonView,
            panelView: SimplifiedPanelView,
            panelViewOptions: {
                editorConstructor: this.editorConstructor,
                editorConfig: this.editorConfig,
                maxWidth: 320,
                model: this.model,
                editor: this.editor
            },
            buttonViewOptions: {
                editor: this.editor,
                model: this.model
            },
            class: 'editor',
            autoopen: true,
            minAvailableHeight: 220
        });
        this.showChildView('editorRegion', menuView);
        this.listenTo(menuView, 'panel:dropdown:close', () => menuView.close());
    },

    __createEditor(options, fieldId) {
        let schemaExtension = {};

        if (_.isFunction(this.schema.schemaExtension)) {
            schemaExtension = this.schema.schemaExtension(this.model);
        }

        this.schema = Object.assign({}, this.schema, schemaExtension);

        const EditorConsturctor = typeof this.schema.type === 'string' ? formRepository.editors[this.schema.type] : this.schema.type;

        this.editorConfig = {
            schema: this.schema,
            form: options.form,
            field: this,
            key: options.key,
            model: this.model,
            id: this.__createEditorId(options.key),
            value: this.options.value,
            fieldId
        };
        this.editor = new EditorConsturctor(this.editorConfig);

        this.editorConstructor = EditorConsturctor;
        this.key = options.key;
        this.editor.on('readonly', readonly => {
            this.__updateEditorState(readonly, this.editor.getEnabled());
        });
        this.editor.on('enabled', enabled => {
            this.__updateEditorState(this.editor.getReadonly(), enabled);
        });
    },

    __updateEditor() {
        this.__createEditor(this.options, this.fieldId);
        this.__showMenuView();
    }
});
