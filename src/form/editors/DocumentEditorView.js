// @flow
import template from './templates/documentEditor.html';
import DocumentReferenceModel from './impl/document/models/DocumentReferenceModel';
import DocumentReferenceCollection from './impl/document/collections/DocumentReferenceCollection';
import BaseCompositeEditorView from './base/BaseCompositeEditorView';
import formRepository from '../formRepository';
import LocalizationService from '../../services/LocalizationService';
import dropdown from 'dropdown';
import PanelView from './impl/datalist/views/PanelView';
import MultiselectItemView from './impl/document/views/MultiselectItemView';
import AttachmentsController from './impl/document/gallery/AttachmentsController';

const classes = {
    dropZone: 'documents__drop-zone',
    activeDropZone: 'documents__drop-zone--active'
};

const MultiselectAddButtonView = Marionette.View.extend({
    className: 'button-sm_h3 button-sm button-sm_add',
    tagName: 'button',
    template: Handlebars.compile('{{text}}')
});

const savedDocumentPrefix = 'document';

const defaultOptions = {
    readonly: false,
    allowDelete: true,
    multiple: true,
    fileFormat: undefined,
    showRevision: true,
    showAll: false,
    createDocuments: documents =>
        // todo: strange method
        Promise.resolve(
            documents.map(doc => ({
                id: doc.id,
                fileName: doc.fileName,
                documentsId: documents.map(item => item.id)
            }))
        ),
    removeDocuments: () => {},
    displayText: ''
};

export default (formRepository.editors.Document = BaseCompositeEditorView.extend({
    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        this.initCollection();

        this.on('change', this.checkEmpty.bind(this));
        this.on('uploaded', documents => {
            if (this.options.multiple === false) {
                this.collection.reset();
                if (this.value && this.value.length && this.value[0].id.indexOf(savedDocumentPrefix) > -1) {
                    documents[0].documentId = this.value[0].id;
                }
            }
            this.uploadDocumentOnServer(documents);
        });

        this.reqres = Backbone.Radio.channel(_.uniqueId('mSelect'));

        this.reqres.reply('value:set', this.onValueAdd, this);
        this.reqres.reply('value:navigate', this.onValueNavigate, this);
        this.reqres.reply('search:more', this.onSearchMore, this);
        this.reqres.reply('filter:text', this.onFilterText, this);

        this.attachmentsController = new AttachmentsController();

        if (this.canAdd) {
            this.renderDropdown();
        }
        this._windowResize = _.throttle(this.update.bind(this), 100, true);
        window.addEventListener('resize', this._windowResize);
    },

    checkEmpty() {
        this.$el.toggleClass('pr-empty', this.collection && this.collection.length === 0);
    },

    canAdd: false,

    className: 'editor editor_document',

    template: Handlebars.compile(template),

    childView: MultiselectItemView,

    childViewContainer: '.js-collection-container',

    childViewOptions() {
        return {
            attachmentsController: this.attachmentsController,
            allowDelete: this.options.allowDelete,
            showRevision: this.options.showRevision
        };
    },

    collapsed: true,

    ui: {
        fileUploadButton: '.js-file-button',
        fileUpload: '.js-file-input',
        form: '.js-file-form',
        showMore: '.js-show-more',
        invisibleCount: '.js-invisible-count',
        showMoreText: '.js-show-more-text'
    },

    focusElement: '.js-file-button',

    templateContext() {
        return Object.assign(this.options, {
            displayText: LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.ADDDOCUMENT'),
            multiple: this.options.multiple,
            fileFormat: this.__adjustFileFormat(this.options.fileFormat),
            placeHolderText: LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.DRAGFILE')
        });
    },

    events: {
        'click @ui.showMore': 'toggleShowMore',
        keydown: '__handleKeydown',
        'change @ui.fileUpload': 'onSelectFiles',
        'click @ui.fileUploadButton': '__onItemClick',
        'dragenter @ui.form': '__onDragenter',
        'dragover @ui.form': '__onDragover',
        'dragleave @ui.form': '__onDragleave',
        'drop @ui.form': '__onDrop'
    },

    childViewEvents: {
        remove: 'removeItem'
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
    },

    __onDragenter(e) {
        e.preventDefault();
        e.stopPropagation();

        this.ui.form.addClass(classes.activeDropZone);
    },

    __onDragover(e) {
        e.preventDefault();
        e.stopPropagation();

        const dataTransfer = e.originalEvent.dataTransfer;

        if (!dataTransfer.items.length || !dataTransfer.types.includes('Files')) {
            return;
        }
        if (this.readonly) {
            dataTransfer.dropEffect = 'none';
        } else {
            dataTransfer.dropEffect = 'move';
        }
    },

    __onDragleave(e) {
        e.preventDefault();
        e.stopPropagation();

        if (e.target.classList.contains(classes.dropZone)) {
            this.ui.form.removeClass(classes.activeDropZone);
        }
    },

    __onDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const files = e.originalEvent.dataTransfer.files;
        this.ui.form.removeClass(classes.activeDropZone);
        if (!files.length) {
            return;
        }
        if (this.__validate(files) && !this.readonly) {
            this._uploadFiles(files);
        }
    },

    initCollection() {
        if (!this.value) {
            this.collection = new DocumentReferenceCollection();
        } else {
            this.collection = new DocumentReferenceCollection(this.value);
        }
    },

    syncValue() {
        this.value = this.collection ? this.collection.toJSON() : [];
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
        this.ui.fileUploadButton.toggle(!isReadonly);
    },

    addItem(items) {
        this.onValueAdd(items);
        this.__triggerChange();
    },

    removeItem(view) {
        this.collection.remove(view.model);
        this.options.removeDocuments([view.model.get('id')]);
        this.__triggerChange();
    },

    __setEnabled(enabled) {
        BaseCompositeEditorView.prototype.__setEnabled.call(this, enabled);
        this.renderUploadButton(!enabled);
    },

    __setReadonly(readonly) {
        BaseCompositeEditorView.prototype.__setReadonly.call(this, readonly);
        if (this.getEnabled()) {
            this.renderUploadButton(readonly);
        }
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.collection.set(value);
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

    __onItemClick() {
        this.ui.fileUpload.click();
    },

    onSelectFiles(e) {
        if (this.internalChange) {
            return;
        }
        const input = e.target;
        const files = input.files;

        if (this.__validate(files) && !this.readonly) {
            this._uploadFiles(files);
        }
    },

    _uploadFiles(files, items) {
        this.trigger('beforeUpload');
        //todo loading
        if (items) {
            //todo wtf
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
                this.internalChange = true;
                this.ui.fileUpload[0].value = null;
                this.internalChange = false;
                this.ui.form.trigger('reset');
                this.trigger('uploaded', resultObjects);
            },
            error: () => {
                this.trigger('failed');
            }
        });
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
    },

    renderDropdown() {
        this.dropdownModel = {
            button: {
                text: LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.ADD')
            },
            panel: {
                collection: this.controller.collection,
                totalCount: this.controller.totalCount || 0
            }
        };
        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: MultiselectAddButtonView,
            buttonViewOptions: {
                model: this.dropdownModel.button,
                reqres: this.reqres
            },
            panelView: PanelView,
            panelViewOptions: {
                model: this.dropdownModel.panel,
                reqres: this.reqres
            }
        });
        this.$selectButtonEl.html(this.dropdownView.render().$el);
    },

    showDropDown() {
        this.dropdownView.open();
    },

    onAttach() {
        this.renderShowMore();
    },

    onValueAdd(model) {
        this.collection.add(model);
        this.trigger('valueAdded', model);
        this.dropdownView && this.dropdownView.close();
        this.renderShowMore();
    },

    onValueNavigate() {
        //todo
        this.controller.navigate(this.getValue());
    },

    onSearchMore() {
        // TODO: Not implemented in Release 1
        this.dropdownView.close();
    },

    onFilterText(options) {
        return this.controller.fetch(options).then(() => this.dropdownModel.get('panel').set('totalCount', this.controller.totalCount));
    },

    toggleShowMore() {
        this.collapsed = !this.collapsed;
        this.renderShowMore();
    },

    renderShowMore() {
        if (this.collapsed && !this.options.showAll) {
            this.collapseShowMore();
        } else {
            this.expandShowMore();
        }
    },

    update() {
        if (this.collapsed && !this.options.showAll) {
            this.collapseShowMore();
        }
    },

    collapseShowMore() {
        if (this.isDestroyed()) {
            return;
        }
        if (!this.getChildViewContainer(this) || !this.getChildViewContainer(this).children() || !this.getChildViewContainer(this).children().length) {
            this.ui.showMore.hide();
            return;
        }
        const affordabletWidth = this.$el.width();
        const childViews = this.getChildViewContainer(this).children();
        let visibleCounter = 1;
        let visibleWidth = /*60 +*/ childViews[0].offsetWidth;
        const length = this.collection.length;
        // visible children
        while (visibleCounter < length && visibleWidth + childViews[visibleCounter].clientWidth < affordabletWidth) {
            visibleWidth += childViews[visibleCounter].clientWidth;
            visibleCounter++;
        }
        // invisible children
        for (let i = visibleCounter; i < length; i++) {
            childViews[i].style.display = 'none';
        }
        if (length - visibleCounter > 0) {
            this.ui.showMore.show();
            this.ui.invisibleCount.html(length - visibleCounter);
            this.ui.showMoreText.html(`${LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.SHOWMORE')} `);
        } else {
            this.ui.showMore.hide();
        }
    },

    expandShowMore() {
        this.getChildViewContainer(this)
            .children()
            .show();
        this.ui.showMoreText.html(LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.HIDE'));
        this.ui.invisibleCount.html('');
    },

    onDestroy() {
        window.removeEventListener('resize', this._windowResize, true);
    },

    __handleKeydown(e) {
        switch (e.keyCode) {
            case 13:
            case 40:
                this.dropdownView.open();
                break;
            default:
                break;
        }
    }
}));
