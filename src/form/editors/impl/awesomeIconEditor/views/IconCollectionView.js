
import template from '../templates/iconCollectionView.html';
import IconItemCategoryView from './IconItemCategoryView';

export default Marionette.CollectionView.extend({
    className: 'ld-setting-dd-panel ld-setting-dd-panel_icons dev-setting-dd-panel_icons',

    template: Handlebars.compile(template),

    childView: IconItemCategoryView,

    childEvents: {
        'click:item': '__triggerChildSelect'
    },

    __triggerChildSelect(model, id) {
        this.trigger('click:item', id);
    }
});
