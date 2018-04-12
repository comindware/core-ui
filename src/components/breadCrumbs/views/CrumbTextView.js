//@flow
import template from '../templates/navigationText.html';

export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    templateHelpers() {
        const isChild = this.model.collection.indexOf(this.model) >= 0;
        return { isChild };
    },

    regions: {
        menuRegion: '.js-menu-region'
    },

    className: 'crumb_view',

    ui: {
        title: '.js-title',
        subtitle: '.js-subtitle'
    },

    events: {
        mouseenter: '__onMouseEnter',
        mouseleave: '__onMouseLeave',
        'click @ui.subtitle': '__handleSubtextClick'
    },

    onRender() {
        const collection = this.model.get('collection');
        if (collection) {
            this.menuView = Core.dropdown.factory.createDropdown({
                buttonView: Marionette.ItemView.extend({
                    template: false
                }),

                panelView: Marionette.CollectionView.extend({
                    childView: Marionette.ItemView.extend({
                        template: false
                    }),

                    className: 'dropdown-list'
                }),

                panelViewOptions: {
                    collection
                },

                panelPosition: 'down'
            });

            this.menuRegion.show(this.menuView);
        }
    },

    modelEvents: {
        'change:name': '__onNameChange'
    },

    __onNameChange() {
        this.ui.title.text(this.model.get('name'));
    },

    __handleSubtextClick() {
        this.menuView.open();
    },

    __onMouseEnter() {
        this.ui.title.animate(
            {
                marginTop: 0
            },
            150
        );
        this.ui.subtitle.animate(
            {
                marginTop: 0
            },
            150
        );
    },

    __onMouseLeave() {
        this.ui.title.animate(
            {
                marginTop: '8px'
            },
            150
        );
        this.ui.subtitle.animate(
            {
                marginTop: '30px'
            },
            150
        );
    }
});
