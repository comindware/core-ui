
import { helpers } from 'utils';
import template from '../templates/galleryWindow.html';
import LoadingView from './LoadingView';

const classes = {
    GALLERY_WINDOW: 'js-gallery-window galleryWindow'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'reqres');
        this.reqres = options.reqres;
    },

    className: classes.GALLERY_WINDOW,

    template: Handlebars.compile(template),

    ui: {
        close: '.js-close',
        download: '.js-download',
        image: '.js-image'
    },

    regions: {
        loadingRegion: '.js-loading-region'
    },

    events: {
        click: '__onClick',
        'click @ui.close': '__onClose',
        'click @ui.download': '__onDownload',
        'click @ui.image': '__onImageClick'
    },

    onRender() {
        this.__addImage(this.model);
    },

    setLoading(visible) {
        if (visible) {
            this.showChildView('loadingRegion', new LoadingView());
        } else {
            this.getRegion('loadingRegion').reset();
        }
    },

    __onClose() {
        this.reqres.trigger('close');
    },

    __onDownload() {
        const url = this.model.get('url');
        if (url) {
            window.open(url);
        }
    },

    __onImageClick() {
        const collection = this.options.imagesCollection;
        let index = collection.indexOf(this.model);
        if (index === collection.length - 1) {
            index = 0;
        } else {
            index++;
        }
        this.model = collection.at(index);
        this.__addImage(this.model);
    },

    __onClick(event) {
        if (event.target.className === classes.GALLERY_WINDOW) {
            this.__onClose();
            return false;
        }
    },

    __addImage(model) {
        this.ui.image.empty().append(this.reqres.trigger('image:get', model));
    }
});
