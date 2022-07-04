import GalleryWindowView from './views/GalleryWindowView';
import SelectableDocsCollection from './collections/SelectableDocsCollection';

export default Marionette.MnObject.extend({
    initialize() {
        this.imagesBuffer = {};
        this.bindReqres();
    },

    bindReqres() {
        this.reqres = Backbone.Radio.channel(_.uniqueId('attachC'));
        this.reqres.reply('gallery:close', this.__closeGallery, this);
        this.reqres.reply('image:download', model => this.__onDownload(model));
        this.reqres.reply('image:delete', model => this.__onDelete(model));
    },

    showGallery(model) {
        if (this.isModelHasPreview(model)) {
            this.imagesCollection = new SelectableDocsCollection(model.collection.filter(item => item.get('previewTag')));
            this.view = new GalleryWindowView({
                reqres: this.reqres,
                imagesCollection: this.imagesCollection,
                model
            });

            this.__popupId = Core.services.WindowService.showPopup(this.view, { showGlobalFadingPanel: false });
            return true;
        }
        return false;
    },

    isModelHasPreview(model) {
        return model.has('previewTag');
    },

    __closeGallery() {
        Core.services.WindowService.closePopup(this.__popupId, true);
    },

    __onDownload(model) {
        model.trigger('attachments:download');
    },

    __onDelete(cloneModel) {
        const modelToDelete = this.imagesCollection.find(model => _.isEqual(model.toJSON(), cloneModel.toJSON()));
        this.__deleteDocument(modelToDelete);
        this.__closeGallery();
    },

    __deleteDocument(model) {
        model.trigger('attachments:remove', model);
    }
});
