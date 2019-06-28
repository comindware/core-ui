import template from '../templates/iconCollectionView.html';
import IconItemCategoryView from './IconItemCategoryView';

export default Marionette.CollectionView.extend({
    className: 'ld-setting-dd-panel_icons icons-panel-collection',

    template: Handlebars.compile(template),

    childView: IconItemCategoryView,

    childViewEvents: {
        'click:item': '__triggerChildSelect'
    },

    __triggerChildSelect(model) {
        this.trigger('click:item', model);
    }
});
