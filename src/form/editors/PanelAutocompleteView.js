import list from 'list';
import template from './templates/panel.hbs';
import meta from './impl/datalist/meta';
import ItemAutoCompleteView from './ItemAutoCompleteView'; 
const config = {
    CHILD_HEIGHT: 35,
    SELECTED_CHILD_HEIGHT: 24
};

const classes = {
    DISABLE_SELECT: 'disable-select',
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.View.extend({
    initialize(options = {}) {
        this.collection = this.options.collection;
    },

    className() {
        return 'dropdown__wrp datalist-panel';
    },

    template: Handlebars.compile(template),

    regions: {
        selectedRegion: {
            el: '.js-selected',
            replaceElement: false //defaultList (collectionView) change parent height
        },
        listRegion: {
            el: '.js-list-region',
            replaceElement: true
        }
    },

    ui: {
        addNewButton: '.js-add-new',
        warning: '.js-warning',
        selected: '.js-selected',
        splitter: '.js-splitter'
    },

    onAttach() {
        if (true) {
            this.listView = new list.GridView({
                collection: this.collection,
                class: 'datalist-panel_list',
                childView: ItemAutoCompleteView,
                disableKeydownHandler: true,
                title: this.options.listTitle,
                columns: [],
                showHeader: false,
                childViewOptions: {
                    getDisplayText: this.options.getDisplayText,
                    subTextOptions: this.options.subTextOptions
                },
                emptyViewOptions: {
                    text: Localizer.get('CORE.FORM.EDITORS.REFERENCE.NOITEMS'),
                    className: classes.EMPTY_VIEW
                },
                selectOnCursor: false,
                childHeight: config.CHILD_HEIGHT
            });

            this.showChildView('listRegion', this.listView);
            this.listenTo(this.listView, 'update:height', () => {
                this.trigger('change:content');
            });
            this.toggleSelectable();
        }
    },

    toggleSelectable() {
        if (this.isAttached() && true) {
            this.getChildView('listRegion').el?.classList.toggle(classes.DISABLE_SELECT, false);
        }
    },

    toggleSelectAddNewButton(state) {
        if (this.isAttached()) {
            this.ui.addNewButton.toggleClass(meta.classes.BUBBLE_SELECT, !!state);
        }
    },

    __updateSplitter() {
        this.ui.splitter.toggle(!!this.options.selectedCollection.length);
    }
});
