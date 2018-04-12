//@flow
import DocumentRevisionItemView from './DocumentRevisionItemView';
import template from '../templates/documentRevisionPanel.html';

export default Marionette.CompositeView.extend({
    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            isSingleRevision: this.collection.length === 1
        };
    },

    childView: DocumentRevisionItemView,

    childViewContainer: '.js-revision-list'
});
