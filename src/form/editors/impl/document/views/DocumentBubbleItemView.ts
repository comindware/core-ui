//@flow
import dropdown from 'dropdown';
import template from '../templates/documentBubbleItem.html';
import DocumentRevisionButtonView from './DocumentRevisionButtonView';
import DocumentRevisionPanelView from './DocumentRevisionPanelView';
import DocumentItemController from '../controllers/DocumentItemController';
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';
import iconWrapDownload from '../../../iconsWraps/iconWrapPreview.html';
import ExtensionIconService from '../services/ExtensionIconService';
import UIService from '../../../../../services/UIService';

import meta from '../meta';
import { iconsNames } from '../../../../../Meta';

export default Marionette.View.extend({
    initialize(options) {
        this.revisionCollection = new Backbone.Collection();
        const controller = new DocumentItemController({ view: this });
        this.reqres = controller.reqres;

        this.attachmentsController = options.attachmentsController;
    },

    regions: {
        reviseRegion: '.js-revise-button-region'
    },

    tagName: 'li',

    template: Handlebars.compile(template),

    templateContext() {
        const { text, name, isLoading, extension } = this.model.toJSON();
        return {
            text: text || name,
            icon: ExtensionIconService.getIconForDocument({ isLoading, extension, name })
        };
    },

    className: 'task-links__i',

    ui: {
        remove: '.js-bubble-delete',
        revise: '.js-revise-button-region',
        link: '.js-link',
        previewButton: '.js-preview-button'
    },

    triggers: {
        'click @ui.remove': 'remove'
    },

    events: {
        'click @ui.revise': '__getDocumentRevision',
        'click @ui.link': '__onLinkClick',
        mouseenter: '__onMouseenter',
        mouseleave: '__onMouseleave',
        'click @ui.previewButton': '__showPreview'
    },

    modelEvents: {
        'change:isLoading': 'render'
    },

    __onLinkClick(event: MouseEvent): void {
        if (this.__isNew() && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(this.model.get('file'), this.model.get('name'));
            event.preventDefault();
        }
    },

    __getDocumentRevision() {
        this.isRevisionButtonClicked = true;
        this.reqres.request('document:revise', this.model.id).then(revisionList => {
            this.revisionCollection.reset(revisionList.sort((a, b) => a.version - b.version));
            this.documentRevisionPopout.open();
        });
    },

    __showPreview() {
        this.attachmentsController.showGallery(this.model);
    },

    __onMouseenter() {
        this.__addRemoveButton();
        this.__addRevisionButton();
        this.__addPreviewButton();
    },

    __addRemoveButton() {
        if (!this.options.allowDelete || this.__removeButtonElement) {
            return;
        }
        this.__removeButtonElement = UIService.createElementsFromHTML(iconWrapRemoveBubble)[0];
        this.el.insertAdjacentElement('beforeend', this.__removeButtonElement);
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

    __addPreviewButton() {
        if (!this.attachmentsController.isModelHasPreview(this.model)) {
            return;
        }
        this.__previewElement = UIService.createElementsFromHTML(iconWrapDownload, { preview: iconsNames.preview })[0];
        this.ui.previewButton.get(0).insertAdjacentElement('beforeend', this.__previewElement);
    },

    __isNew() {
        return !this.model.id?.startsWith(meta.savedDocumentPrefix);
    },

    __onMouseleave() {
        this.__removeRemoveButton();
        this.__removeRevisionButton();
        this.__removePreviewButton();
    },

    __removeRemoveButton() {
        if (!this.options.allowDelete || !this.__removeButtonElement) {
            return;
        }
        this.el.removeChild(this.__removeButtonElement);
        delete this.__removeButtonElement;
    },

    __removeRevisionButton() {
        if (!this.isRevisionButtonClicked) {
            this.ui.revise.hide();
        }
    },

    __removePreviewButton() {
        if (!this.__previewElement) {
            return;
        }
        this.ui.previewButton.get(0).removeChild(this.__previewElement);
        delete this.__previewElement;
    }
});
