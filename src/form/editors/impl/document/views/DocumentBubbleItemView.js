//@flow
import dropdown from 'dropdown';
import template from '../templates/documentBubbleItem.html';
import DocumentRevisionButtonView from './DocumentRevisionButtonView';
import DocumentRevisionPanelView from './DocumentRevisionPanelView';
import DocumentItemController from '../controllers/DocumentItemController';
import iconWrapRemoveBubble from '../../../iconsWraps/iconWrapRemoveBubble.html';
import ExtensionIconService from '../services/ExtensionIconService';

import meta from '../meta';

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
        return {
            text: this.model.get('text') || this.model.get('name'),
            icon: ExtensionIconService.getIconForDocument(this.model.get('isLoading'), this.model.get('extension'))
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

    __getDocumentRevision() {
        this.isRevisionButtonClicked = true;
        this.reqres.request('document:revise', this.model.id).then(revisionList => {
            this.revisionCollection.reset(revisionList.sort((a, b) => a.version - b.version));
            this.documentRevisionPopout.open();
        });
    },

    __showPreview() {
        const result = this.attachmentsController.showGallery(this.model);
        if (this.__isNew() && window.navigator.msSaveOrOpenBlob && result) {
            window.navigator.msSaveOrOpenBlob(this.model.get('file'), this.model.get('name'));
            return false;
        }

        return result;
    },

    __onMouseenter() {
        if (this.options.allowDelete) {
            this.el.insertAdjacentHTML('beforeend', iconWrapRemoveBubble);
        }
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

    __isNew() {
        return !this.model.id?.startsWith(meta.savedDocumentPrefix);
    },

    __onMouseleave() {
        if (this.options.allowDelete) {
            this.el.removeChild(this.el.lastElementChild);
        }
        if (!this.isRevisionButtonClicked) {
            this.ui.revise.hide();
        }
    }
});
