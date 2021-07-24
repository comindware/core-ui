import dropdown from 'dropdown';
import RevisionPanelView from './DocumentRevisionPanelView';
import RevisionButtonView from './RevisionButtonView';
import template from '../templates/tooltipTemplate.html';

export default Marionette.View.extend({
    initialize() {
        this.model.set('readonly', this.options.readonly);
        this.model.set('allowDelete', this.options.allowDelete);
        this.editorHasHistory = this.options.editorHasHistory;
        this.reqres = this.options.reqres;
        this.revisionCollection = new Backbone.Collection();
    },

    template: Handlebars.compile(template),

    ui: {
        removeButton: '.js-delete-button',
        downloadButton: '.js-download-button',
        revisionButton: '.js-revise-button-region'
    },

    events: {
        'click @ui.downloadButton': '__download',
        'click @ui.revisionButton': '__revision',
        'click @ui.removeButton': '__remove'
    },

    regions: {
        reviseRegion: '.js-revise-button-region'
    },

    onRender() {
        if (this.editorHasHistory !== false) {
            this.documentRevisionPopout = new dropdown.factory.createDropdown({
                buttonView: RevisionButtonView,
                panelView: RevisionPanelView,
                panelViewOptions: { collection: this.revisionCollection },
                popoutFlow: 'right',
                autoOpen: true,
                panelMinWidth: 'none'
            });
            this.showChildView('reviseRegion', this.documentRevisionPopout);
        }
    },

    __getDocumentRevision() {
        this.isRevisionButtonClicked = true;
        this.reqres.request('document:revise', this.model.id).then((revisionList: Array<any>) => {
            this.revisionCollection.reset(revisionList.sort((a, b) => a.version - b.version));
            this.documentRevisionPopout.open();
        });
    },

    __download() {
        if (this.options.clickHandler) {
            this.options.clickHandler('download');
        }
    },

    __revision() {
        if (this.options.clickHandler) {
            this.__getDocumentRevision();
            this.options.clickHandler('revision');
        }
    },

    __remove() {
        if (this.options.clickHandler) {
            this.options.clickHandler('remove');
        }
    }
});
