//@flow
import GalleryWindowView from './views/GalleryWindowView';

const classes = {
    IMAGE: 'galleryImageBuffer',
    HIDDEN: 'hidden'
};

const graphicFileExtensions = ['gif', 'png', 'bmp', 'jpg', 'jpeg', 'jfif', 'jpeg2000', 'exif', 'tiff', 'ppm', 'pgm', 'pbm', 'pnm', 'webp', 'bpg', 'bat'];

export default Marionette.MnObject.extend({
    initialize() {
        this.imagesBuffer = {};
        this.bindReqres();
    },

    bindReqres() {
        this.reqres = Backbone.Radio.channel(_.uniqueId('attachC'));
        this.reqres.reply('close', this.__closeGallery, this);
        this.reqres.reply('image:get', this.__getImage, this);
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
