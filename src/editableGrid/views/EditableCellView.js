import template from '../templates/editableCell.hbs';
import EditableGridFieldView from './EditableGridFieldView';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        editorRegion: '.js-editor'
    },

    onRender() {
        // _.defer(() => this.__showEditor());
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

        this.editorView = new EditableGridFieldView({
            schema: Object.assign({}, this.schema, { readonly, hidden }, schemaExtension),
            key: this.schema.key,
            model: this.model.get('rowModel'),
        });
        this.editorRegion.show(this.editorView);
        this.editorIsShown = true;
    },

    __onMouseLeave() {
        this.editorRegion.reset();
    }
});
