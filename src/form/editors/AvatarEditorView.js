// @flow
import { helpers } from 'utils';
import BaseItemEditorView from './base/BaseItemEditorView';
import template from './templates/avatarEditor.hbs';
import formRepository from '../formRepository';

const defaultOptions = {
    removable: true,
    autoUpload: false,
    refreshPreviewAfterUpload: false,
    controller: undefined
};

/**
 * @name AvatarEditorView
 * @memberof module:core.form.editors
 * @class Editor used to set (or unset) an image to be used mainly as user avatar and process it any way (e.g. upload to server).
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {string} options.fullName - Full name used to fill editor with initials when no value is provided.
 * @param {boolean} options.removable - Flags whether an image may be removed (editor's value is set to <code>null</code>).
 * @param {boolean} options.autoUpload - Flags whether to upload (or process any other way) an image after it has been selected via file explorer.
 * Instead, method <code>upload</code> can be called on editor to do it manually.
 * @param {boolean} options.refreshPreviewAfterUpload - Flags whether to refresh editor with value returned by <code>upload</code> method.
 * This only makes sense when <code>upload</code> method returns value coresponding to image other than image used as argument to <code>upload</code> method.
 * @param {BaseAvatarEditorController} options.controller - Data provider controller in the form of subclass of
 * {@link module:core.form.editors.avatar.controllers.BaseAvatarEditorController BaseAvatarEditorController}.
 */

export default (formRepository.editors.Avatar = BaseItemEditorView.extend({
    className: 'user-avatar-wrp',

    attributes: {
        tabindex: 0
    },

    template: Handlebars.compile(template),

    ui: {
        image: '.js-image',
        remove: '.js-remove',
        initials: '.js-initials',
        tooltip: '.js-tooltip'
    },

    events: {
        click: '__attach',
        'click @ui.remove': '__remove'
    },

    initialize(options = {}) {
        _.defaults(this.options, _.pick(options.schema ? options.schema : options, Object.keys(defaultOptions)), defaultOptions);

        helpers.ensureOption(this.options, 'controller');
        this.controller = this.getOption('controller');

        this.__removed = false;
        this.__previewURL = null;
        this.__initFileInput();
    },

    onRender() {
        this.ui.initials.append(this.__getInitials(this.getOption('fullName') || ''));

        if (this.getValue()) {
            this.__preview(this.controller.getImage(this.getValue()));
        } else if (this.getOption('fullName')) {
            this.ui.initials.show();
        } else {
            this.__preview(this.controller.getImage());
        }

        this.ui.tooltip.hide();
        this.ui.remove.hide();

        this.$el.hover(
            () => {
                if (this.getEnabled() && !this.getReadonly()) {
                    this.ui.tooltip.show();
                }

                if (this.getEnabled() && !this.getReadonly() && this.getOption('removable') && this.ui.image.css('background-image') !== 'none') {
                    this.ui.remove.show();
                }
            },
            () => {
                this.ui.tooltip.hide();
                this.ui.remove.hide();
            }
        );
    },

    onBeforeDestroy() {
        URL.revokeObjectURL(this.__previewURL);
    },

    upload() {
        const file = this.fileInput.files[0];
        this.__initFileInput();

        if (file) {
            return this.controller.upload(file).then(data => {
                if (!this.__removed) {
                    this.setValue(data.value);
                    this.__triggerChange();

                    if (this.getOption('refreshPreviewAfterUpload')) {
                        this.__preview(this.controller.getImage(this.getValue()));
                    }
                }
            });
        }
        return Promise.resolve();
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

            this.__removed = false;
            this.__preview(this.fileInput.files[0]);

            if (this.getOption('autoUpload')) {
                this.upload();
            }
        };
    },

    __getInitials(fullName) {
        const words = fullName.split(' ');

        switch (words.length) {
            case 0:
                return null;
            case 1:
                if (words[0] === '') {
                    return null;
                }
                return fullName.substr(0, 2).toUpperCase();
            default:
                return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
        }
    },

    __attach() {
        if (this.getEnabled() && !this.getReadonly() && document.body) {
            document.body.appendChild(this.fileInput);
            this.fileInput.click();
            if (document.body) {
                document.body.removeChild(this.fileInput);
            }
        }
    },

    __remove() {
        if (this.getEnabled() && !this.getReadonly()) {
            this.setValue(null);
            this.__triggerChange();

            URL.revokeObjectURL(this.__previewURL);
            this.ui.image.css('background-image', 'none');
            this.ui.remove.hide();
            this.ui.initials.show();

            this.__removed = true;
        }

        return false;
    },

    __preview(image) {
        this.ui.initials.hide();
        URL.revokeObjectURL(this.__previewURL);
        let previewURL;

        if (_.isString(image)) {
            // URL
            previewURL = image;
        } else if (_.isObject(image) && {}.toString.call(image).slice(8, -1) === 'File') {
            // file
            previewURL = this.__previewURL = URL.createObjectURL(image);
        }

        previewURL && this.ui.image.css('background-image', `url("${previewURL}")`);
    }
}));
