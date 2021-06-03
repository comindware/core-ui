import formRepository from '../formRepository';
import { fieldTypes } from 'Meta';
import _ from 'underscore';

type EditorOptions = {
    model: Backbone.Model,
    showLabel: boolean,
    showHelpText: boolean,
    schema: any,
    title: string,
    tagName: string,
    class: string,
    id: string,
    key: string,
    form: any,
    attributes: any,
    value: any
};

export default class FieldView {
    constructor(options: EditorOptions) {
        options.showLabel = options.showLabel !== undefined ? options.showLabel : true;
        options.showHelpText = options.showHelpText !== undefined ? options.showHelpText : true;
        const editor = this.__createEditor(options);

        return editor;
    }

    __getEditorConstructor(type: string) {
        if (typeof type === 'function') {
            return type;
        }

        return formRepository.editors[type];
    }

    __createEditor(options: EditorOptions) {
        let schemaExtension = {};

        if (_.isFunction(options.schema.schemaExtension)) {
            schemaExtension = options.schema.schemaExtension(options.model);
        }

        const schema = { ...options.schema, ...schemaExtension };
        const { tagName, attributes } = options;
        const fieldType = fieldTypes[schema.type];
        const fieldClass = fieldType ? `form-group_${fieldType}` : '';
        const editorOptions = {
            ...schema,
            form: options.form,
            key: options.key,
            model: options.model,
            id: this.__createEditorId(options.model, options.key),
            isField: true,
            value: options.value,
            fieldOptions: {
                showLabel: options.showLabel,
                showHelpText: options.showHelpText,
                title: schema.title,
                helpText: schema.helpText,
                tagName: tagName || 'div',
                attributes,
                className: options.class || `form-group ${fieldClass}`
            }
        };

        const EditorConstructor = this.__getEditorConstructor(schema.type);

        return new EditorConstructor(editorOptions);
    }

    __createEditorId(model: Backbone.Model, key: string) {
        if (model) {
            return `${model.cid}_${key}`;
        }
        return key;
    }
}
