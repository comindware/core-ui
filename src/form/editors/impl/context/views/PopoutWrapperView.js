import template from '../templates/popoutWrapperPanel.html';
import list from 'list';

export default Marionette.View.extend({
    classes: {
        itemTitleSelected: '.js-item-title-selected'
    },

    events: {
        'click .js-clear-value': '__onChildItemTitleSelectEmpty',
        mousewheel: '__handleMousewheel'
    },

    regions: {
        popoutWrapper: {
            el: '.js-popout-wrapper',
            replaceElement: true
        }
    },

    template: Handlebars.compile(template),

    className: 'data-source-popout-view',

    onRender() {
        const columns = [
            {
                key: 'name',
                type: 'String',
                title: 'TextCell',
                sorting: 'asc',
                width: 240
            }
        ];

        const listView = list.factory.createDefaultGrid({
            gridViewOptions: {
                columns,
                selectableBehavior: 'multi',
                isTree: true,
                childrenAttribute: 'children',
                showHeader: false,
                expandOnShow: false,
                class: 'compact'
            },
            collection: this.model.get('context')
        });

        this.showChildView('popoutWrapper', listView);

        listView.on('childview:dblclick', model => this.trigger('context:selected', model));
    }
});
