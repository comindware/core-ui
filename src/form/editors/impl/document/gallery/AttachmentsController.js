/**
 * Developer: Ksenia Kartvelishvili
 * Date: 8/25/2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import GalleryWindowView from './views/GalleryWindowView';

const classes = {
    IMAGE: 'galleryImageBuffer',
    HIDDEN: 'hidden'
};

const graphicFileExtensions = ['gif', 'png', 'bmp', 'jpg', 'jpeg'];

export default Marionette.Object.extend({
    initialize() {
        this.imagesBuffer = {};
        this.bindReqres();
    },

    bindReqres() {
        this.reqres = new Backbone.Wreqr.RequestResponse();
        this.reqres.setHandler('close', this.__closeGallery, this);
        this.reqres.setHandler('image:get', this.__getImage, this);
    },
    
    showGallery(model) {
        if (this.__isImage(model)) {
            this.view = new GalleryWindowView({
                reqres: this.reqres,
                imagesCollection: new Backbone.Collection(model.collection.filter(m => this.__isImage(m))),
                model
            });
            this.__togglePopupRegion(true);
            window.application.popupRegion.show(this.view);
            return false;
        }
        return true;
    },

    __closeGallery() {
        this.__togglePopupRegion(false);
        window.application.popupRegion.empty();
    },

    __getImage(model) {
        const modelId = model.get('id');
        if (_.has(this.imagesBuffer, modelId)) {
            return this.imagesBuffer[modelId];
        }
        this.view.setLoading(true);
        const image = $(document.createElement('img'));
        image.addClass(classes.IMAGE);
        image.attr('src', model.get('url'));
        image.load(() => {
            this.view.setLoading(false);
        });
        this.imagesBuffer[modelId] = image;
        return image;
    },
    
    __togglePopupRegion(show) {
        window.application.ui.popupRegion.toggleClass(classes.HIDDEN, !show);
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
