import template from '../templates/editableCell.hbs';
import EditableGridFieldView from './EditableGridFieldView';

export default Marionette.LayoutView.extend({
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
        }
        if (_.isFunction(this.schema.schemaExtension)) {
            schemaExtension = this.schema.schemaExtension(rowModel);
        }
        this.editorView = new EditableGridFieldView({
            schema: Object.assign({}, this.schema, { readonly }, schemaExtension),
            key: this.schema.key,
            model: this.model.get('rowModel'),
        });
        this.editorRegion.show(this.editorView);
    }
});
