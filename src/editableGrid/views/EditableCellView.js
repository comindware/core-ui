import template from '../templates/editableCell.hbs';
import EditableGridFieldView from './EditableGridFieldView';

export default Marionette.View.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor'
    },

    onRender() {
        let readonly = this.schema.readonly;
        let schemaExtension = {};
        const rowModel = this.model.get('rowModel');
        if (_.isFunction(this.schema.getReadonly)) {
            readonly = this.schema.getReadonly(rowModel);
            this.listenTo(rowModel, 'change', () => this.editorView.editor.setReadonly(this.schema.getReadonly(rowModel)));
        }
        if (_.isFunction(this.schema.schemaExtension)) {
            schemaExtension = this.schema.schemaExtension(rowModel);
        }

        if (this.schema.rerenderModelEvent) {
            this.listenToOnce(rowModel, this.schema.rerenderModelEvent, this.render);
        }

        this.editorView = new EditableGridFieldView({
            schema: Object.assign({}, this.schema, { readonly }, schemaExtension),
            key: this.schema.key,
            model: this.model.get('rowModel'),
        });
        this.editorRegion.show(this.editorView);
    }
});
