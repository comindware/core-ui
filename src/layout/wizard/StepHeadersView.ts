import HeaderItemView from './WizardHeaderItemView';

export default Marionette.CollectionView.extend({
    tagName: 'ul',

    className: 'layout__wizard__header-view',

    childView: HeaderItemView
});
