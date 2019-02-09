//@flow
import dropdown from 'dropdown';
import template from '../templates/documentBubbleItem.html';
import DocumentRevisionButtonView from './DocumentRevisionButtonView';
import DocumentRevisionPanelView from './DocumentRevisionPanelView';
import DocumentItemController from '../controllers/DocumentItemController';
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';
import GalleryWindowView from '../gallery/views/GalleryWindowView';

const savedDocumentPrefix = 'document';

const fileIconClasses = {
    image: 'jpeg jpg jif jfif png gif tif tiff bmp',
    word: 'docx doc rtf',
    excel: 'xls xlsx xlsm xlsb',
    pdf: 'pdf'
};

const graphicFileExtensions = ['gif', 'png', 'bmp', 'jpg', 'jpeg', 'jfif', 'jpeg2000', 'exif', 'tiff', 'ppm', 'pgm', 'pbm', 'pnm', 'webp', 'bpg', 'bat'];

const classes = {
    IMAGE: 'galleryImageBuffer',
    HIDDEN: 'hidden'
};

export default Marionette.View.extend({
    initialize(options) {
        this.revisionCollection = new Backbone.Collection();
        const controller = new DocumentItemController({ view: this });
        this.reqres = controller.reqres;
        this.imagesBuffer = {};
        this.bindReqres();
    },

    regions: {
        reviseRegion: '.js-revise-button-region'
    },

    tagName: 'li',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.model.get('text') || this.model.get('name'),
            icon: this.__getExtIcon()
        };
    },

    className: 'task-links__i',

    ui: {
        remove: '.js-bubble-delete',
        revise: '.js-revise-button-region',
        link: '.js-link'
    },

    triggers: {
        'click @ui.remove': 'remove'
    },

    events: {
        'click @ui.revise': '__getDocumentRevision',
        'click @ui.link': '__showPreview',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave'
    },

    modelEvents: {
        'change:isLoading': 'render'
    },

    bindReqres() {
        this.reqres = Backbone.Radio.channel(_.uniqueId('attachC'));
        this.reqres.reply('close', this.__closeGallery, this);
        this.reqres.reply('image:get', this.__getImage, this);
    },

    __getExtIcon() {
        if (this.model.get('isLoading')) {
            return 'spinner pulse';
        }
        const ext = this.model.get('extension');
        let icon;

        if (ext) {
            Object.keys(fileIconClasses).forEach(key => {
                if (fileIconClasses[key].indexOf(ext.toLowerCase()) !== -1) {
                    icon = key;
                }
            });
        }

        return icon || 'file';
    },

    __getDocumentRevision() {
        this.reqres.request('document:revise', this.model.id).then(revisionList => {
            this.revisionCollection.reset(revisionList.sort((a, b) => a.version - b.version));
            this.isRevisionOpen = true;
            this.documentRevisionPopout.open();
        });
    },

    __showPreview() {
        return this.attachmentsController.showGallery(this.model);
    },

    __onMouseenter() {
        if (this.options.allowDelete) {
            this.el.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
        }
        if (this.model.id?.indexOf(savedDocumentPrefix) > -1 && this.options.showRevision) {
            if (!this.isRevisonButtonShown) {
                this.documentRevisionPopout = new dropdown.factory.createDropdown({
                    buttonView: DocumentRevisionButtonView,
                    panelView: DocumentRevisionPanelView,
                    panelViewOptions: { collection: this.revisionCollection },
                    popoutFlow: 'right',
                    autoOpen: false,
                    panelMinWidth: 'none'
                });
                this.documentRevisionPopout.on('close', () => (this.isRevisionOpen = false));
                this.showChildView('reviseRegion', this.documentRevisionPopout);
                this.isRevisonButtonShown = true;
            } else {
                this.ui.revise.show();
            }
        }
    },

    __onMouseleave() {
        if (this.options.allowDelete) {
            this.el.removeChild(this.el.lastElementChild);
        }
        if (!this.isRevisionOpen) {
            this.ui.revise.hide();
        }
    },

    showGallery(model) {
        if (this.__isImage(model)) {
            this.view = new GalleryWindowView({
                reqres: this.reqres,
                imagesCollection: new Backbone.Collection(model.collection.filter(m => this.__isImage(m))),
                model
            });
            Core.services.WindowService.showPopup(this.view);
            return false;
        }
        return true;
    },

    __closeGallery() {
        Core.services.WindowService.closePopup();
    },

    __getImage(model) {
        const modelId = model.get('id');
        if (modelId in this.imagesBuffer) {
            return this.imagesBuffer[modelId];
        }
        this.view.setLoading(true);
        const image = document.createElement('img');
        image.classList.add(classes.IMAGE);
        image.setAttribute('src', model.get('url'));
        image.addEventListener('load', () => {
            this.view.setLoading(false);
        });
        this.imagesBuffer[modelId] = image;
        return image;
    },

    __isImage(model) {
        let isImage = false;
        const extension = model.get('extension');
        if (extension && typeof extension === 'string' && graphicFileExtensions.indexOf(extension.toLowerCase()) > -1) {
            isImage = true;
        }
        return isImage;
    }
});
