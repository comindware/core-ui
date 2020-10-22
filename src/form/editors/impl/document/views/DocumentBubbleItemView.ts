import dropdown from 'dropdown';
import template from '../templates/documentBubbleItem.html';
import DocumentRevisionButtonView from './DocumentRevisionButtonView';
import DocumentRevisionPanelView from './DocumentRevisionPanelView';
import DocumentItemController from '../controllers/DocumentItemController';
import ExtensionIconService from '../services/ExtensionIconService';
import meta from '../meta';

export default Marionette.View.extend({
    initialize(options) {
        this.revisionCollection = new Backbone.Collection();
        const controller = new DocumentItemController({ view: this });
        this.reqres = controller.reqres;

        this.attachmentsController = options.attachmentsController;
        this.listenTo(this.model, 'attachments:download', this.__download);
    },

    regions: {
        reviseRegion: '.js-revise-button-region'
    },

    tagName: 'li',

    template: Handlebars.compile(template),

    templateContext() {
        const { text, name, isLoading, extension, embeddedType } = this.model.toJSON();
        return {
            text: text || name,
            icon: ExtensionIconService.getIconForDocument({ isLoading, extension, name }),
            isInline: this.options.isInline && embeddedType
        };
    },

    className: 'document-list',

    ui: {
        remove: '.js-delete-button',
        revise: '.js-revise-button-region',
        link: '.js-link',
        downloadButton: '.js-download-button',
        edit: '.js-document-edit-btn'
    },

    triggers: {
        'click @ui.remove': 'remove'
    },

    events: {
        'click @ui.revise': '__getDocumentRevision',
        'click @ui.link': '__onLinkClick',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave',
        'click @ui.downloadButton': '__download',
        'click @ui.remove': '__remove'
    },

    modelEvents: {
        'change:isLoading': 'render'
    },

    onRender() {
        this.__removeButtons();
        if (this.__isMouseenter) {
            this.__addButtons();
        }
    },

    __getDocumentRevision() {
        this.isRevisionButtonClicked = true;
        this.reqres.request('document:revise', this.model.id).then((revisionList: Array<any>) => {
            this.revisionCollection.reset(revisionList.sort((a, b) => a.version - b.version));
            this.documentRevisionPopout.open();
        });
    },

    __onLinkClick(linkDownloadEvent: MouseEvent) {
        if (this.__isDownload) {
            this.__isDownload = false;
            this.__executeDownload(linkDownloadEvent);
            return;
        }

        if (this.attachmentsController.isModelHasPreview(this.model)) {
            this.attachmentsController.showGallery(this.model);
            linkDownloadEvent.preventDefault();
        } else {
            this.__executeDownload(linkDownloadEvent);
        }
    },

    __download(e: MouseEvent) {
        this.__isDownload = true;
        this.ui.link.get(0).click();
    },

    __remove() {
        this.model.trigger('attachments:remove', this.model);
    },

    __executeDownload(linkDownloadEvent: MouseEvent) {
        if (this.__isNew() && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(this.model.get('file'), this.model.get('name'));
            linkDownloadEvent.preventDefault();
        }
    },

    __onMouseenter() {
        this.__isMouseenter = true;
        this.__addButtons();
    },

    __addButtons() {
        this.__addRemoveButton();
        this.__addRevisionButton();
        this.__addDownloadButton();
        this.__addEditButton();
    },

    __addRemoveButton() {
        if (!this.options.allowDelete) {
            return;
        }
        this.ui.remove.show();
    },

    __addRevisionButton() {
        if (!this.__isNew() && this.options.showRevision) {
            if (!this.isRevisonButtonShown) {
                this.documentRevisionPopout = new dropdown.factory.createDropdown({
                    buttonView: DocumentRevisionButtonView,
                    panelView: DocumentRevisionPanelView,
                    panelViewOptions: { collection: this.revisionCollection },
                    popoutFlow: 'right',
                    autoOpen: false,
                    panelMinWidth: 'none'
                });
                this.documentRevisionPopout.on('close', () => (this.isRevisionButtonClicked = false));
                this.showChildView('reviseRegion', this.documentRevisionPopout);
                this.isRevisonButtonShown = true;
            } else {
                this.ui.revise.show();
            }
        }
    },

    __addDownloadButton() {
        this.ui.downloadButton.show();
    },

    __addEditButton() {
        if (!this.options.isInline) {
            return;
        }
        this.ui.edit.get(0) && this.ui.edit.show();
    },

    __isNew() {
        return !this.model.id?.startsWith(meta.savedDocumentPrefix);
    },

    __onMouseleave() {
        this.__isMouseenter = true;
        this.__removeButtons();
    },

    __removeButtons() {
        this.__removeRemoveButton();
        this.__removeRevisionButton();
        this.__removeDownloadButton();
        this.__removeEditButton();
    },

    __removeRemoveButton() {
        this.ui.remove.hide();
    },

    __removeRevisionButton() {
        if (!this.isRevisionButtonClicked) {
            this.ui.revise.hide();
        }
    },

    __removeDownloadButton() {
        this.ui.downloadButton.hide();
    },

    __removeEditButton() {
        this.ui.edit.get(0) && this.ui.edit.hide();
    }
});
