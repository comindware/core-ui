// @flow
import PromiseService from '../../services/PromiseService';
import template from './templates/documentEditor.html';
import BaseCollectionEditorView from './base/BaseCollectionEditorView';
import formRepository from '../formRepository';
import LocalizationService from '../../services/LocalizationService';
import dropdown from 'dropdown';
import PanelView from './impl/datalist/views/PanelView';
import DocumentBubbleItemView from './impl/document/views/DocumentBubbleItemView';
import AttachmentsController from './impl/document/gallery/AttachmentsController';
import DocumentsCollection from './impl/document/collections/DocumentsCollection';
import WindowService from '../../services/WindowService';
import CropperEditorView from './CropperEditorView';

const classes = {
    dropZone: 'documents__drop-zone',
    activeDropZone: 'documents__drop-zone--active',
    collapsed: 'documents-collapse_collapsed'
};

const tempIdPrefix = 'temp.';
const serverTempIdPrefix = 'cmw.temp.';

const MultiselectAddButtonView = Marionette.View.extend({
    className: 'button-sm_h3 button-sm button-sm_add',
    tagName: 'button',
    template: Handlebars.compile('{{text}}')
});

const defaultOptions = options => ({
    readonly: false,
    allowDelete: true,
    multiple: true,
    fileFormat: '',
    showRevision: true,
    createImage: null,
    editImage: null,
    removeImage: null,
    displayText: '',
    isInline: false
});

const MAX_NUMBER_VISIBLE_DOCS = 2;

export default formRepository.editors.Image = BaseCollectionEditorView.extend({
    initialize(options = {}) {
        this.__applyOptions(options, defaultOptions);

        this.cropOptions = options.cropOptions;

        this.collection = new DocumentsCollection(this.value);
        this.listenTo(this.collection, 'attachments:remove', this.removeItem);

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
            showRevision: this.options.showRevision,
            isInline: this.options.isInline
        };
    },

    collapsed: true,

    isDropZoneCollapsed: false,

    ui: {
        collapseIcon: '.js-collapse-icon',
        fileUploadButton: '.js-file-button',
        fileUpload: '.js-file-input',
        fileZone: '.js-file-zone',
        showMore: '.js-show-more',
        invisibleCount: '.js-invisible-count',
        showMoreText: '.js-show-more-text'
    },

    focusElement: '.js-file-button',

    cropTemps: [],

    templateContext() {
        const isDropZoneCollapsed = this.isDropZoneCollapsed;
        return Object.assign(this.options, {
            displayText: LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.ADDDOCUMENT'),
            placeHolderText: isDropZoneCollapsed ? '' : LocalizationService.get('CORE.FORM.EDITORS.DOCUMENT.DRAGFILE'),
            multiple: this.options.multiple,
            fileFormat: this.__adjustFileFormat(this.options.fileFormat)
        });
    },

    events() {
        return {
            'click @ui.collapseIcon': '__onCollapseClick',
            'click @ui.showMore': 'toggleShowMore',
            keydown: '__handleKeydown',
            'change @ui.fileUpload': 'onSelectFiles',
            'click @ui.fileUploadButton': '__onItemClick',
            'dragenter @ui.fileZone': '__onDragenter',
            'dragover @ui.fileZone': '__onDragover',
            'dragleave @ui.fileZone': '__onDragleave',
            'drop @ui.fileZone': '__onDrop'
        };
    },

    async setValue(value) {
        this.__value(value);
        this.update();
        if (value) {
            this.files = [];
            for (let i = 0; i < value.length; i++) {
                if (this.isTemp(value[i].id) && !this.cropTemps.includes(value[i].id)) {
                    this.cropTemps.push(value[i].id);
                    await this.__getCropperPopup(value[i]);
                }
            }

            if (this.files.length) {
                this.__editElementsCollection(this.files);
                this.files.forEach(model => {
                    model.uniqueId = this.options.editImage?.(model);
                });
                this.ui.fileZone.trigger('reset');
                this.__triggerChange();
            }
        }
    },

    isTemp(objectId) {
        return !objectId || objectId.startsWith(tempIdPrefix) || objectId.startsWith(serverTempIdPrefix);
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

    // override
    checkChange() {},

    __onDragenter(e) {
        e.preventDefault();
        e.stopPropagation();

        this.ui.fileZone.addClass(classes.activeDropZone);
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
            this.ui.fileZone.removeClass(classes.activeDropZone);
        }
    },

    __onDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const files = e.originalEvent.dataTransfer.files;
        this.ui.fileZone.removeClass(classes.activeDropZone);
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
                    const { file, isLoading, uniqueId, ...rest } = m;
                    return rest;
                })
            : [];
    },

    addItems(items) {
        this.onValueAdd(items);
        this.__updateEmpty();
    },

    removeItem(model) {
        this.collection.remove(model);
        this.options.removeImage?.(model.id);
        this.__triggerChange();
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
                uniqueId: _.uniqueId('image-')
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
                        const id = this.options.createImage?.(model.toJSON());
                        if (id) {
                            model.set({ id });
                        }
                        model.set({ uniqueId: id || streamId });
                    }
                }
                this.internalChange = true;
                this.ui.fileUpload[0].value = null;
                this.internalChange = false;
                this.ui.fileZone.trigger('reset');
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

    __editElementsCollection(resultObjects) {
        resultObjects.forEach(changeModel => {
            this.collection.remove(this.collection.find(model => model.id === changeModel.id));
            this.collection.add(changeModel);
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
        if (this.collapsed) {
            this.collapseShowMore();
        } else {
            this.expandShowMore();
        }
    },

    update() {
        if (this.collapsed) {
            this.$container.children().show();
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
        const childViews = documentElements;
        const length = this.collection.length;
        // invisible children
        for (let i = MAX_NUMBER_VISIBLE_DOCS; i < length; i++) {
            childViews[i].style.display = 'none';
        }
        if (length - MAX_NUMBER_VISIBLE_DOCS > 0) {
            this.ui.showMore.show();
            this.ui.invisibleCount.html(length - MAX_NUMBER_VISIBLE_DOCS);
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
    },

    __onCollapseClick() {
        const collapsed = this.isDropZoneCollapsed;
        this.isDropZoneCollapsed = !collapsed;
        this.__updateCollapseButton();
    },

    __updateCollapseButton() {
        this.render();
        this.$el.toggleClass(classes.collapsed, this.isDropZoneCollapsed);
    },

    __getCropperPopup(file) {
        this.trigger('set:loading', true);
        return new Promise(resolve => {
            const cropperView = new CropperEditorView({
                file,
                cropOptions: {
                    aspectRatio: this.cropOptions?.aspectRatio
                }
            });
            const cropPopup = new Core.layout.Popup({
                size: {
                    width: 'auto',
                    height: 'auto'
                },
                header: 'Cropper', // todo localize
                onClose() {
                    resolve(true);
                },
                buttons: [
                    {
                        id: false,
                        text: 'Cancel Crop', // todo localize
                        isCancel: true,
                        handler() {
                            resolve(true);
                        }
                    },
                    {
                        id: true,
                        text: 'Save Crop image', // todo localize
                        handler() {
                            cropPopup.trigger('save:upload', cropperView.getCrop());
                            resolve(true);
                        }
                    }
                ],
                content: new Core.layout.Form({
                    model: new Backbone.Model(),
                    schema: [
                        {
                            type: 'v-container',
                            items: [
                                {
                                    id: 'expression',
                                    name: 'Computed Expression',
                                    view: cropperView
                                }
                            ]
                        }
                    ]
                })
            });
            this.listenTo(cropPopup, 'save:upload', changedFile => {
                this.files.push(changedFile);
            });
            WindowService.showPopup(cropPopup);
        }).then(() => {
            WindowService.closePopup();
            this.trigger('set:loading', false);
        });
    }
});
