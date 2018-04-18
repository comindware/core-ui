//@flow
import dropdown from 'dropdown';
import template from '../templates/MultiselectItem.html';
import DocumentRevisionButtonView from './DocumentRevisionButtonView';
import DocumentRevisionPanelView from './DocumentRevisionPanelView';
import DocumentItemController from '../controllers/DocumentItemController';
import iconWrapRemove from '../../../iconsWraps/iconWrapRemove.html';

const savedDocumentPrefix = 'document';

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

    templateHelpers() {
        return {
            text: this.model.get('text') || this.model.get('name')
        };
    },

    className: 'task-links__i dev-task-links__links__i',

    ui: {
        remove: '.js-remove-button',
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

    __getDocumentRevision() {
        this.reqres.request('document:revise', this.model.get('id')).then(revisionList => {
            this.revisionCollection.reset(revisionList.sort((a, b) => a.version - b.version));
            this.documentRevisionPopout.open();
        });
    },

    __showPreview() {
        return this.attachmentsController.showGallery(this.model);
    },

    __onMouseenter() {
        if (!this.options.hideRemoveBtn) {
            this.el.insertAdjacentHTML('beforeend', iconWrapRemove);
        }
        if (this.model.get('id').indexOf(savedDocumentPrefix) > -1) {
            if (!this.isRevisonButtonShown) {
                this.documentRevisionPopout = new dropdown.factory.createDropdown({
                    buttonView: DocumentRevisionButtonView,
                    panelView: DocumentRevisionPanelView,
                    panelViewOptions: { collection: this.revisionCollection },
                    popoutFlow: 'right',
                    autoOpen: false
                });
                this.showChildView('reviseRegion', this.documentRevisionPopout);
                this.isRevisonButtonShown = true;
            } else {
                this.ui.revise.show();
            }
        }
    },

    __onMouseleave() {
        if (!this.options.hideRemoveBtn) {
            this.el.removeChild(this.el.lastElementChild);
        }
        this.ui.revise.hide();
    }
});
