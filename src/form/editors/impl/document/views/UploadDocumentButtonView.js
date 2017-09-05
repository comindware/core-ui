/**
 * Developer: Kristina
 * Date: 01/25/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/uploadDocumentButton.html';

export default Backbone.Marionette.ItemView.extend({

    uploadUrl: '/api/UploadAttachment',

    options: {
        multiple: true,
        displayText: '',
        fileFormat: ''
    },

    className: 'l-input-upload',

    ui: {
        fileUploadButton: '.js-file-button',
        fileUpload: '.js-file-input',
        form: '.js-file-form'
    },

    events: {
        'change @ui.fileUpload': 'onSelectFiles',
        'click @ui.fileUploadButton': '__onItemClick'
    },

    template: Handlebars.compile(template),

    templateHelpers() {
        return this.options;
    },

    initialize(options, className) {
        _.extend(this.options, options || {});
        if (className) {
            this.className = className;
        }
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
            $.when(this._readFileEntries(items)).done(fileEntrie => {
                this._sendFilesToServer(fileEntrie);
            });
        } else {
            this._sendFilesToServer(files);
        }
    },

    // recursive loading of folders is currently supported only in chrome
    // promise function
    _readFileTree(itemEntry) {
        return new Promise((resolve => {
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
        }));
    },

    //typeof filesEntries is array of DataTransfer
    _readFileEntries(fileEntries) {
        const deferrArray = [];
        const returnDeferr = new $.Deferred();

        for (let i = 0; i < fileEntries.length; i++) {
            let entry;
            if (fileEntries[i].getAsEntry) { //Standard HTML5 API
                entry = fileEntries[i].getAsEntry();
            } else if (fileEntries[i].webkitGetAsEntry) { //WebKit implementation of HTML5 API.
                entry = fileEntries[i].webkitGetAsEntry();
            }
            if (entry) {
                deferrArray.push(this.readFileTree(entry));
            }
        }
        $.when.apply(this, deferrArray).done(() => {
            returnDeferr.resolve(_.flatten(arguments));
        });
        return returnDeferr;
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
                window.tmp_res1 = data;
                const retObjs = [];
                for (let i = 0; i < window.tmp_res1.fileIds.length; i++) {
                    const currFileName = files[i].name;
                    const obj = {
                        id: window.tmp_res1.fileIds[i],
                        fileName: currFileName,
                        type: currFileName ? currFileName.replace(/.*\./g, '') : ''
                    };
                    retObjs.push(obj);
                }
                this.ui.fileUpload[0].value = null;
                this.ui.form.trigger('reset');
                this.trigger('uploaded', retObjs);
                //this.save(retObjs);
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
        let incorrectFileNames = '';
        let fileFormat = this.options.fileFormat.toLowerCase();

        if (!files) {
            return false;
        }

        if (!fileFormat) {
            return true;
        }

        fileFormat = fileFormat.toLowerCase();

        for (let i = 0; i < files.length; i += 1) {
            ext = files[i].name.split('.').pop().toLowerCase();
            if (fileFormat.indexOf(ext) === -1) {
                incorrectFileNames += `${files[i].name}, `;
            }
        }

        return true;
    }
});
