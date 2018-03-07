// @flow
import template from './templates/documentEditor.html';
import MultiselectView from './impl/document/views/MultiselectView';
import UploadButton from './impl/document/views/UploadDocumentButtonView';
import DocumentReferenceModel from './impl/document/models/DocumentReferenceModel';
import DocumentReferenceCollection from './impl/document/collections/DocumentReferenceCollection';
import BaseLayoutEditorView from './base/BaseLayoutEditorView';
import formRepository from '../formRepository';
import LocalizationService from '../../services/LocalizationService';

const savedDocumentPrefix = 'document';

const defaultOptions = {
    readonly: false,
    allowDelete: true,
    multiple: true,
    fileFormat: undefined,
    createDocuments: documents => Promise.resolve([{
        id: documents[0].id,
        fileName: documents[0].fileName,
        documentsId: [documents[0].id]
    }]),
    removeDocuments: () => {}
};

formRepository.editors.Document = BaseLayoutEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        this.on('change', this.checkEmpty.bind(this));
    },

    checkEmpty() {
        this.$el.toggleClass('pr-empty', this.internalValue && this.internalValue.length === 0);
    },

    className: 'document-field editor',

    template: Handlebars.compile(template),

    regions: {
        addRegion: '.js-add-region',
        multiselect: '.js-documents-multiselect'
    },

    ui: {
        addRegion: '.js-add-region'
    },

    templateHelpers() {
        return this.options;
    },

    setValue(value) {
        this.__value(value);
    },

    getValue() {
        this.syncValue();
        return this.value;
    },

    onRender() {
        this.renderUploadButton(this.options.readonly);
        this.renderMultiselect();
    },

    initInternalValue() {
        if (!this.value) {
            this.internalValue = new DocumentReferenceCollection();
        } else {
            this.internalValue = new DocumentReferenceCollection(this.value);
        }
    },

    syncValue() {
        this.value = this.internalValue.toJSON();
    },

    renderMultiselect() {
        if (!this.internalValue) {
            this.initInternalValue();
        }
        this.multiselectView = new MultiselectView({
            collection: this.internalValue,
            canAdd: false,
            hideRemoveBtn: this.options.readonly || !this.options.allowDelete
        });
        this.multiselectView.on('removeItem', this.removeItem.bind(this));
        this.multiselect.show(this.multiselectView);
        this.checkEmpty();
    },

    uploadDocumentOnServer(documents) {
        this.options.createDocuments(documents).then(results => {
            const tDocs = results.map(doc => {
                const mappedObject = documents.find(uploadDoc => uploadDoc.id === doc.id);

                return new DocumentReferenceModel({
                    id: doc.id,
                    documentsId: documents.map(item => item.id),
                    name: doc.FileName || doc.fileName, // TODO fix API
                    url: doc.DocumentLink || null,
                    type: mappedObject ? mappedObject.type : null // TODO fix API
                });
            });
            this.addItem(tDocs);
        });
    },

    renderUploadButton(isReadonly) {
        if (!isReadonly) {
            this.ui.addRegion.show();
            this.uploadButton = new UploadButton(
                {
                    displayText: LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.ADDDOCUMENT'),
                    multiple: this.options.multiple,
                    fileFormat: this.__adjustFileFormat(this.options.fileFormat) },
                'add-document'
            );
            this.uploadButton.on('uploaded', documents => {
                if (this.options.multiple === false) {
                    this.multiselectView.collection.reset();
                    if (this.value && this.value.length && this.value[0].id.indexOf(savedDocumentPrefix) > -1) {
                        documents[0].documentId = this.value[0].id;
                    }
                }
                this.uploadDocumentOnServer(documents);
            });
            this.addRegion.show(this.uploadButton);
        } else {
            if (this.addRegion.hasView()) {
                this.addRegion.empty();
            }
            this.ui.addRegion.hide();
        }
    },

    addItem(items) {
        this.multiselectView.onValueAdd(items);
        this.__triggerChange();
    },

    removeItem(model) {
        this.internalValue.remove(model);
        this.options.removeDocuments([model.get('id')]);
        this.__triggerChange();
    },

    __setEnabled(enabled) {
        BaseLayoutEditorView.prototype.__setEnabled.call(this, enabled);
        this.renderUploadButton(!enabled);
    },

    __setReadonly(readonly) {
        BaseLayoutEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled()) {
            this.renderUploadButton(readonly);
        }
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.internalValue.set(value);
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __adjustFileFormat(fileFormat) {
        if (!fileFormat) {
            return '';
        }
        let result = '';

        for (let i = 0; i < fileFormat.length; i += 1) {
            result += `.${fileFormat[i].toLowerCase()}`;
            if (i < fileFormat.length - 1) {
                result += ',';
            }
        }

        return result;
    }
});

export default formRepository.editors.Document;
