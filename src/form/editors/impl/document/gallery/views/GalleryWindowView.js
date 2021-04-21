//@flow
import { helpers, keyCode } from 'utils';
import template from '../templates/galleryWindow.html';
import GlobalEventService from 'services/GlobalEventService';
import PreviewsCollectionView from './PreviewsCollectionView';
import ImageView from './ImageView';
import InfoWidgetView from './InfoWidgetView';
import { iconsNames } from 'Meta';

const classes = {
    GALLERY_WINDOW: 'gallery-window',
    ZOOMED_IN: 'zoomed-in',
    HIDDEN: 'hidden',
    FULL_SCREEN_MODE: 'fullscreen-mode'
};

const directions = {
    next: 'next',
    previous: 'previous'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'reqres');
        this.reqres = options.reqres;
        this.imagesCollection = options.imagesCollection;
        this.selectedModelClone = this.imagesCollection.selectedModelClone;
        this.listenTo(this.imagesCollection, 'select:one', model => this.__drawImage(model));
        this.listenTo(GlobalEventService, 'window:keydown:captured', (document, event) => this.__keyAction(event));

        const root = document.documentElement;
        this.__requestFullscreen = DOMElement => (root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullScreen || root.msRequestFullscreen).call(DOMElement);
        this.__exitFullscreen = () => (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen).call(document);

        document.documentElement.onfullscreenchange = () => this.__onfullscreenchange();
    },

    className: classes.GALLERY_WINDOW,

    template: Handlebars.compile(template),

    templateContext() {
        const isMobile = Core.services.MobileService.isMobile;
        return {
            ...iconsNames,
            isMobile
        };
    },

    ui: {
        previousButton: '.js-previous-image',
        nextButton: '.js-next-image',
        closeButton: '.js-close',
        expandButton: '.js-expand',
        minimizeButton: '.js-minimize',
        zoomInButton: '.js-zoom-in',
        zoomOutButton: '.js-zoom-out',
        deleteButton: '.js-delete',
        downloadButton: '.js-download'
    },

    events: {
        click: '__onClick',
        'click @ui.previousButton': '__onPreviousImage',
        'click @ui.nextButton': '__onNextImage',
        'click @ui.closeButton': '__onCloseBtnClick',
        'click @ui.expandButton': '__toggleScreenMode',
        'click @ui.minimizeButton': '__toggleScreenMode',
        'click @ui.zoomInButton': '__onZoomIn',
        'click @ui.zoomOutButton': '__onZoomOut',
        'click @ui.deleteButton': '__onDeleteBtnClick',
        'click @ui.downloadButton': '__onDownloadBtnClick'
    },

    regions: {
        downloadPanelRegion: {
            el: '.js-download-panel',
            replaceElement: true
        },
        infoWidgetRegion: {
            el: '.js-info-widget-region',
            replaceElement: true
        },
        mainImageRegion: {
            el: '.js-image-region',
            replaceElement: true
        },
        collectionRegion: '.js-previews-collection-region'
    },

    onRender() {
        this.getRegion('collectionRegion').show(new PreviewsCollectionView({ collection: this.imagesCollection }));
        this.getRegion('infoWidgetRegion').show(new InfoWidgetView({ model: this.selectedModelClone }));
        this.getRegion('mainImageRegion').show(new ImageView({ model: this.selectedModelClone }));
    },

    onAttach() {
        this.imagesCollection.select(this.model);
    },

    onDestroy() {
        document.documentElement.onfullscreenchange = undefined;
    },

    __onPreviousImage() {
        this.__selectNext(directions.previous);
    },

    __onNextImage() {
        this.__selectNext(directions.next);
    },

    __selectNext(direction) {
        const collection = this.imagesCollection;
        let index = collection.indexOf(collection.getSelected());
        if (direction === directions.next) {
            if (index === collection.length - 1) {
                index = 0;
            } else {
                index++;
            }
        } else if (direction === directions.previous) {
            if (index === 0) {
                index = collection.length - 1;
            } else {
                index--;
            }
        }
        collection.select(collection.at(index));
    },

    __onClick(event) {
        if (event.target.classList.contains(classes.GALLERY_WINDOW)) {
            this.__onClose();
        }
    },

    __onClose() {
        this.options.reqres.request('gallery:close');
    },

    __drawImage() {
        const fileNameElements = document.querySelectorAll('.js-fileName');

        fileNameElements.forEach(element => {
            element.innerText = `${this.selectedModelClone.get('name')}.${this.selectedModelClone.get('extension')}`;
            element.title = this.selectedModelClone.get('url');
        });
    },

    __toggleClass(DOMElement, CSSclass, state) {
        if (state) {
            DOMElement.classList.add(CSSclass);
        } else {
            DOMElement.classList.remove(CSSclass);
        }
    },

    __toggleZoomMode(isZoomedIn) {
        this.__toggleClass(this.el, classes.ZOOMED_IN, isZoomedIn);
        this.__toggleClass(this.ui.zoomInButton[0], classes.HIDDEN, isZoomedIn);
        this.__toggleClass(this.ui.zoomOutButton[0], classes.HIDDEN, !isZoomedIn);
    },

    __onZoomIn() {
        this.__toggleZoomMode(true);
    },

    __onZoomOut() {
        this.__toggleZoomMode(false);
    },

    __toggleScreenMode() {
        if (!document.fullscreenElement) {
            this.__requestFullscreen(this.el);
        } else {
            this.__exitFullscreen(this.el);
        }
    },

    __onfullscreenchange() {
        const isFullScreen = document.fullscreenElement;
        this.__toggleClass(this.el, classes.FULL_SCREEN_MODE, isFullScreen);
        this.__toggleClass(this.ui.expandButton[0], classes.HIDDEN, isFullScreen);
        this.__toggleClass(this.ui.minimizeButton[0], classes.HIDDEN, !isFullScreen);
    },

    __keyAction(event) {
        event.stopPropagation();
        switch (event.keyCode) {
            case keyCode.ESCAPE:
                this.__onClose();
                break;
            case keyCode.LEFT:
                this.__onPreviousImage();
                break;
            case keyCode.RIGHT:
                this.__onNextImage();
                break;
            default:
                break;
        }
    },

    __onCloseBtnClick() {
        this.__onClose();
    },

    __onDownloadBtnClick() {
        this.options.reqres.request('image:download', this.model);
    },

    __onDeleteBtnClick() {
        this.options.reqres.request('image:delete', this.model);
    }
});
