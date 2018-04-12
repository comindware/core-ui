// @flow
import template from './templates/documentEditor.html';
import MultiselectView from './impl/document/views/MultiselectView';
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
    createDocuments: documents =>
        Promise.resolve([
            {
                id: documents[0].id,
                fileName: documents[0].fileName,
                documentsId: [documents[0].id]
            }
        ]),
    removeDocuments: () => {},
    displayText: ''
};

export default (formRepository.editors.Document = BaseLayoutEditorView.extend({
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
        addRegion: '.js-add-region',
        fileUploadButton: '.js-file-button',
        fileUpload: '.js-file-input',
        form: '.js-file-form'
    },

    templateHelpers() {
        return Object.assign(this.options, {
            displayText: LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.ADDDOCUMENT'),
            multiple: this.options.multiple,
            fileFormat: this.__adjustFileFormat(this.options.fileFormat)
        });
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

            this.on('uploaded', documents => {
                if (this.options.multiple === false) {
                    this.multiselectView.collection.reset();
                    if (this.value && this.value.length && this.value[0].id.indexOf(savedDocumentPrefix) > -1) {
                        documents[0].documentId = this.value[0].id;
                    }
                }
                this.uploadDocumentOnServer(documents);
            });
        } else {
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
    },

    uploadUrl: '/api/UploadAttachment',

    events: {
        'change @ui.fileUpload': 'onSelectFiles',
        'click @ui.fileUploadButton': '__onItemClick'
    },

    __onItemClick() {
        this.ui.fileUpload.click();
    },

    onSelectFiles(e) {
        const input = e.target;
        const files = input.files;

        if (this.__validate(files)) {
            this._uploadFiles(files);
        }
    },

    _uploadFiles(files, items) {
        this.trigger('beforeUpload');
        //todo loading
        if (!files || this.readonly) return;

        if (items) {
            Promise.resolve(this._readFileEntries(items)).then(fileEntrie => {
                this._sendFilesToServer(fileEntrie);
            });
        } else {
            this._sendFilesToServer(files);
        }
    },

    // recursive loading of folders is currently supported only in chrome
    // promise function
    _readFileTree(itemEntry) {
        return new Promise(resolve => {
            if (itemEntry.isFile) {
                itemEntry.file(file => {
                    resolve(file);
                });
            } else if (itemEntry.isDirectory) {
                const dirReader = itemEntry.createReader();
                dirReader.readEntries(entries => {
                    Promise.map(entries, entry => this._readFileTree(entry)).then(() => {
                        resolve(_.flatten(arguments));
                    });
                });
            }
        });
    },

    //typeof filesEntries is array of DataTransfer
    _readFileEntries(fileEntries) {
        const deferrArray = [];

        for (let i = 0; i < fileEntries.length; i++) {
            let entry;
            if (fileEntries[i].getAsEntry) {
                //Standard HTML5 API
                entry = fileEntries[i].getAsEntry();
            } else if (fileEntries[i].webkitGetAsEntry) {
                //WebKit implementation of HTML5 API.
                entry = fileEntries[i].webkitGetAsEntry();
            }
            if (entry) {
                deferrArray.push(this.readFileTree(entry));
            }
        }

        return Promise.all(deferrArray).then(() => _.flatten(arguments));
    },

    _sendFilesToServer(files) {
        const form = new FormData();
        if (this.options.multiple === false) {
            form.append('file1', files[0]);
        } else {
            for (let i = 0; i < files.length; i++) {
                form.append(`file${i + 1}`, files[i]);
            }
        }

        $.ajax({
            url: this.uploadUrl,
            data: form,
            processData: false,
            type: 'POST',
            contentType: false,
            encoding: 'multipart/form-data',
            enctype: 'multipart/form-data',
            mimeType: 'multipart/form-data',
            success: data => {
                const tempResult = JSON.parse(data);
                const resultObjects = [];
                for (let i = 0; i < tempResult.fileIds.length; i++) {
                    const currFileName = files[i].name;
                    const obj = {
                        id: tempResult.fileIds[i],
                        fileName: currFileName,
                        type: currFileName ? currFileName.replace(/.*\./g, '') : ''
                    };
                    resultObjects.push(obj);
                }
                this.ui.fileUpload[0].value = null;
                this.ui.form.trigger('reset');
                this.trigger('uploaded', resultObjects);
            },
            error: () => {
                this._fallback();
            }
        });
    },

    _fallback() {
        this.trigger('failed');
    },

    __validate(files) {
        let ext = '';
        let fileFormat = this.options.fileFormat.toLowerCase();
        let incorrectFileNames = '';

        if (!files) {
            return false;
        }

        if (!fileFormat) {
            return true;
        }

        fileFormat = fileFormat.toLowerCase();

        for (let i = 0; i < files.length; i += 1) {
            ext = files[i].name
                .split('.')
                .pop()
                .toLowerCase();
            if (fileFormat.indexOf(ext) === -1) {
                incorrectFileNames += `${files[i].name}, `;
            }
        }

        // TODO: show validation error
        this.trigger('validation:error', incorrectFileNames);

        return !incorrectFileNames;
    }
}));
