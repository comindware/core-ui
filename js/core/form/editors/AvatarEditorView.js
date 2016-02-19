/**
 * Developer: Oleg Verevkin
 * Date: 02/19/2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import {helpers} from '../../utils/utilsApi';
import BaseItemEditorView from './base/BaseItemEditorView';
import template from './templates/avatarEditor.hbs';

const defaultOptions = {
    autoUpload: false,
    refreshPreviewAfterUpload: false
};

Backbone.Form.editors.Avatar = BaseItemEditorView.extend({
    className: 'dev-avatar-editor',

    attributes: {
        tabindex: 0
    },
    
    focusElement: null,
    
    template: template,
    
    ui: {
        initials: '.js-initials',
        tooltip: '.js-tooltip'
    },
    
    events: {
        click: '__attach'
    },
    
    initialize(options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }
        
        helpers.ensureOption(options, 'controller');
        this.controller = this.getOption('controller');        
        
        this.__previewURL = null;
        this.__initFileInput();
    },
    
    onRender() {
        if (this.getValue()) {
            this.__preview(this.controller.getImage(this.getValue()));
        } else if (this.getOption('fullName')) {
            this.ui.initials.append(this.__getInitials(this.getOption('fullName')));
            this.ui.initials.show();
        } else {
            this.__preview(this.controller.getImage());
        }
        
        this.ui.tooltip.hide();
        
        this.$el.hover(
            () => {
                this.ui.tooltip.show();
            },
            () => {
                this.ui.tooltip.hide();
            }
        );
    },
    
    onBeforeDestroy() {
        if (this.__previewURL) {
            URL.revokeObjectURL(this.__previewURL);
        }
    },
    
    upload() {
        if (this.fileInput.files[0]) {
            return this.controller.upload(this.fileInput.files[0]).then(data => {
                this.setValue(data.value);
                this.__triggerChange();
                this.__initFileInput();
                
                if (this.getOption('refreshPreviewAfterUpload')) {
                    this.__preview(this.controller.getImage(this.getValue()));
                }
            });
        }
    },
    
    __initFileInput() {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.style.display = 'none';
        
        this.fileInput.oninput = this.fileInput.onchange = () => {
            if (!(this.fileInput.files && this.fileInput.files.length)) {
                return;
            }
            
            this.__preview(this.fileInput.files[0]);
            
            if (this.getOption('autoUpload')) {
                this.upload();
            }
        };
    },
    
    __getInitials(fullName) {
        let words = fullName.split(' ');
        
        switch (words.length) {
            case 0:
                return null;
            case 1:
                if (words[0] === '') {
                    return null;
                }
                return fullName.substr(0, 3).toUpperCase();
            case 2:
                return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
            default:
                return (words[0].charAt(0) + words[1].charAt(0) + words[2].charAt(0)).toUpperCase();
        }
    },
    
    __attach() {
        document.body.appendChild(this.fileInput);
        this.fileInput.click();
        document.body.removeChild(this.fileInput);
    },
    
    __preview(image) {
        this.ui.initials.hide();
        
        if (this.__previewURL) {
            URL.revokeObjectURL(this.__previewURL);
        }
        
        let previewURL;
        
        if (_.isString(image)) { // URL
            previewURL = image;
        } else if (_.isObject(image) && {}.toString.call(image).slice(8, -1) === 'File') { // file
            previewURL = this.__previewURL = URL.createObjectURL(image);
        }
        
        this.$el.css('background-image', `url("${previewURL}")`);
    }
});

export default Backbone.Form.editors.Avatar;