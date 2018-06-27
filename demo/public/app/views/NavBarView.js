import NavBarItemView from './NavBarItemView';

export default Marionette.CollectionView.extend({
    className: 'demo-nav',

    childView: NavBarItemView
});
