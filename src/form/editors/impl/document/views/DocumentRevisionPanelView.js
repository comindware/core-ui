//@flow
import DocumentRevisionItemView from './DocumentRevisionItemView';
import template from '../templates/documentRevisionPanel.html';

export default Marionette.CollectionView.extend({
    template: Handlebars.compile(template),

    templateContext() {
        return {
            isSingleRevision: this.collection.length === 1
        };
    },

    className: 'dropdown__wrp',

    childView: DocumentRevisionItemView,

    childViewContainer: '.js-revision-list'
});
