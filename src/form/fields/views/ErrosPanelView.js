import ErrorItemView from './ErrorItemView';

export default Marionette.CollectionView.extend({
    tagName: 'ul',

    className: 'form-label__error-panel',

    template: false,

    childView: ErrorItemView
});
