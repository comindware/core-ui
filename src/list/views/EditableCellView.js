import template from '../templates/editableCell.hbs';
import EditableGridFieldView from './EditableGridFieldView';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor'
    },

    onRender() {
        this.__showEditor();
    },

    __showEditor() {
        if (this.editorIsShown) {
            return;
        }
        let readonly = this.schema.readonly;
        let hidden = this.schema.hidden;
        let schemaExtension = {};
        const rowModel = this.model.get('rowModel');
        if (_.isFunction(this.schema.getReadonly)) {
            readonly = this.schema.getReadonly(rowModel);
            this.listenTo(rowModel, 'change', () => this.editorView.editor.setReadonly(this.schema.getReadonly(rowModel)));
        }
        if (_.isFunction(this.schema.getHidden)) {
            hidden = this.schema.getHidden(rowModel);
            this.listenTo(rowModel, 'change', () => this.editorView.editor.setHidden(this.schema.getHidden(rowModel)));
        }
        if (_.isFunction(this.schema.schemaExtension)) {
            schemaExtension = this.schema.schemaExtension(rowModel);
        }

        if (this.schema.rerenderModelEvent) {
            this.listenToOnce(rowModel, this.schema.rerenderModelEvent, this.render);
        }

        const editorType = this.schema.editor || 'Text';
        this.editorView = new EditableGridFieldView({
            schema: Object.assign({}, this.schema, { readonly, hidden, type: editorType }, schemaExtension),
            key: this.schema.key || this.schema.id,
            model: this.model.get('rowModel'),
        });
        this.editorRegion.show(this.editorView);
        this.editorIsShown = true;
    },

    __onMouseLeave() {
        this.editorRegion.reset();
    }
});
