// @flow
import PromiseService from '../../services/PromiseService';
import template from './templates/documentEditor.html';
import BaseCollectionEditorView from './base/BaseCollectionEditorView';
import formRepository from '../formRepository';
import LocalizationService from '../../services/LocalizationService';
import dropdown from 'dropdown';
import PanelView from './impl/datalist/views/PanelView';
import DocumentBubbleItemView from './impl/document/views/DocumentBubbleItemView.js';
import AttachmentsController from './impl/document/gallery/AttachmentsController';
import DocumentsCollection from './impl/document/collections/DocumentsCollection';

const classes = {
    dropZone: 'documents__drop-zone',
    activeDropZone: 'documents__drop-zone--active'
};

const MultiselectAddButtonView = Marionette.View.extend({
    className: 'button-sm_h3 button-sm button-sm_add',
    tagName: 'button',
    template: Handlebars.compile('{{text}}')
});

const defaultOptions = options => ({
    readonly: false,
    allowDelete: true,
    multiple: true,
    fileFormat: undefined,
    showRevision: true,
    showAll: Boolean(options.isCell),
    createDocument: null,
    removeDocument: null,
    displayText: '',
    isCell: false
});

export default (formRepository.editors.Document = BaseCollectionEditorView.extend({
    initialize(options = {}) {
        this.__applyOptions(options, defaultOptions);

        this.collection = new DocumentsCollection(this.value);

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
        this.createdUrls = [];
    },

    canAdd: false,

    className: 'editor editor_document',

    template: Handlebars.compile(template),

    childView: DocumentBubbleItemView,

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
            placeHolderText: LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.DRAGFILE'),
            multiple: this.options.multiple,
            fileFormat: this.__adjustFileFormat(this.options.fileFormat)
        });
    },

    events() {
        return {
            'click @ui.showMore': 'toggleShowMore',
            keydown: '__handleKeydown',
            'change @ui.fileUpload': 'onSelectFiles',
            [`click @ui.${this.options.schema?.isCell ? 'form' : 'fileUploadButton'}`]: '__onItemClick',
            'dragenter @ui.form': '__onDragenter',
            'dragover @ui.form': '__onDragover',
            'dragleave @ui.form': '__onDragleave',
            'drop @ui.form': '__onDrop'
        };
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

    isEmptyValue() {
        return !this.collection.length;
    },

    onDestroy() {
        window.removeEventListener('resize', this._windowResize, true);
        this.createdUrls.forEach(url => window.URL.revokeObjectURL(url));
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

    syncValue() {
        this.value = this.collection
            ? this.collection
                  .toJSON()
                  .filter(model => !model.isLoading)
                  .map(m => {
                      const { file, isLoading, ...rest } = m;
                      return rest;
                  })
            : [];
    },

    addItems(items) {
        this.onValueAdd(items);
        this.__updateEmpty();
    },

    removeItem(view) {
        this.collection.remove(view.model);
        this.options.removeDocument?.(view.model.id);
        this.__triggerChange();
        this.__onCollectionLengthChange();
    },

    __onCollectionLengthChange() {
        if (this.collection?.length) {
            this.el.getElementsByClassName('emptyDocumentPlaceholder')[0].style.display = 'none';
        } else if (this.collection?.length === 0) {
            this.el.getElementsByClassName('emptyDocumentPlaceholder')[0].style.display = 'block';
        }
    },

    __value(value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.collection.set(value || []);
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

    openFileUploadWindow() {
        this.ui.fileUpload.click();
    },

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
        this.trigger('set:loading', true);
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
        const length = this.options.multiple === false ? 1 : files.length;
        const resultObjects = [];
        for (let i = 0; i < length; i++) {
            form.append(`file${i + 1}`, files[i]);
            const currFileName = files[i].name;
            const tempUrl = window.URL.createObjectURL(files[i]);
            this.createdUrls.push(tempUrl);
            const obj = {
                name: currFileName,
                extension: currFileName ? currFileName.replace(/.*\./g, '') : '',
                url: tempUrl,
                file: files[i],
                isLoading: true,
                uniqueId: _.uniqueId('document-')
            };

            resultObjects.push(obj);
        }
        this.trigger('uploaded', resultObjects);
        if (this.options.multiple === false) {
            this.collection.reset();
        }
        this.addItems(resultObjects);

        const config = {
            url: this.uploadUrl,
            data: form,
            processData: false,
            type: 'POST',
            contentType: false,
            encoding: 'multipart/form-data',
            enctype: 'multipart/form-data',
            mimeType: 'multipart/form-data',
            success: data => {
                if (this.isDestroyed()) {
                    return;
                }
                const tempResult = JSON.parse(data);

                for (let i = 0; i < tempResult.fileIds.length; i++) {
                    const model = this.collection.findWhere({ uniqueId: resultObjects[i]?.uniqueId });
                    if (model) {
                        const streamId = tempResult.fileIds[i];
                        model.set({
                            streamId,
                            isLoading: false
                        });
                        const id = this.options.createDocument?.(model.toJSON());
                        if (id) {
                            model.set({ id });
                        }
                        model.set({ uniqueId: id || streamId });
                    }
                }
                this.internalChange = true;
                this.ui.fileUpload[0].value = null;
                this.internalChange = false;
                this.ui.form.trigger('reset');
                this.__triggerChange();
                this.trigger('set:loading', false);
            },
            error: () => {
                this.trigger('set:loading', false);
                this.trigger('failed');
            }
        };

        // eslint-disable-next-line no-undef
        PromiseService.registerPromise($.ajax(config), true);
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
        const documentElements = this.$container.children();
        if (documentElements.length === 0) {
            this.ui.showMore.hide();
            return;
        }
        const affordabletWidth = this.$el.width();
        const childViews = documentElements;
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
        this.$container.children().show();
        this.ui.showMoreText.html(LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.HIDE'));
        this.ui.invisibleCount.html('');
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
