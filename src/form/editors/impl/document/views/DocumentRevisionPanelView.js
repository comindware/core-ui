//@flow
import DocumentRevisionItemView from './DocumentRevisionItemView';
import template from '../templates/documentRevisionPanel.html';

export default Marionette.CollectionView.extend({
    template: Handlebars.compile(template),

    className: 'dropdown__wrp',

    childView: DocumentRevisionItemView,

    childViewContainer: '.js-revision-list'
});
