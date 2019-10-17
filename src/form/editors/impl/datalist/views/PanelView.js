// @flow
import list from 'list';
import template from '../templates/panel.hbs';
import BubbleItemView from './BubbleItemView';
import meta from '../meta';

const config = {
    CHILD_HEIGHT: 35,
    SELECTED_CHILD_HEIGHT: 24
};

const classes = {
    DISABLE_SELECT: 'disable-select',
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.View.extend({
    className() {
        return `dropdown__wrp datalist-panel ${this.options.class || ''}`;
    },

    template: Handlebars.compile(template),

    templateContext() {
        const showSelectedCollection = Boolean(this.options.selectedCollection);
        return {
            showAddNewButton: Boolean(this.options.showAddNewButton),
            showSelectedCollection,
            addNewButtonText: this.options.addNewButtonText,
            showCollection: this.options.showCollection
        };
    },

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

    events() {
        return this.options.addNewItem
            ? {
                  'click @ui.addNewButton': this.options.addNewItem
              }
            : undefined;
    },

    ui: {
        addNewButton: '.js-add-new',
        warning: '.js-warning',
        selected: '.js-selected'
    },

    onAttach() {
        this.collection = this.getOption('collection');
        const selectedCollection = this.options.selectedCollection;
        if (selectedCollection) {
            this.selected = new list.GridView({
                collection: selectedCollection,
                childView: BubbleItemView,
                childViewOptions: this.options.bubbleItemViewOptions,
                disableKeydownHandler: true,
                title: this.options.showSelectedTitle ? this.options.selectedTitle : '',
                columns: [],
                showHeader: false,
                customHeight: true,
                childHeight: config.SELECTED_CHILD_HEIGHT,
                emptyView: null
            });

            this.showChildView('selectedRegion', this.selected);
        }

        if (this.options.showCollection) {
            this.listView = new list.GridView({
                collection: this.collection,
                class: 'datalist-panel_list',
                childView: this.options.listItemView,
                disableKeydownHandler: true,
                title: this.options.listTitle,
                columns: [],
                showHeader: false,
                childViewOptions: {
                    getDisplayText: this.options.getDisplayText,
                    subTextOptions: this.options.subTextOptions,
                    showCheckboxes: this.options.showCheckboxes,
                    canSelect: this.options.canSelect
                },
                emptyViewOptions: {
                    text: Localizer.get('CORE.FORM.EDITORS.REFERENCE.NOITEMS'),
                    className: classes.EMPTY_VIEW
                },
                selectOnCursor: false,
                childHeight: config.CHILD_HEIGHT
            });

            this.showChildView('listRegion', this.listView);

            this.__toggleExcessWarning();

            this.listenTo(this.listView, 'update:height', () => {
                this.trigger('change:content');
            });
            this.listenTo(this.collection, 'add reset update', _.debounce(this.__toggleExcessWarning, 0));

            this.toggleSelectable();
        }
    },

    toggleSelectable(canAddItem = this.options.canAddItem()) {
        if (this.isAttached() && this.options.showCollection) {
            this.getChildView('listRegion').$el.toggleClass(classes.DISABLE_SELECT, !canAddItem);
        }
    },

    toggleSelectAddNewButton(state) {
        if (this.isAttached()) {
            this.ui.addNewButton.toggleClass(meta.classes.BUBBLE_SELECT, !!state);
        }
    },

    __toggleExcessWarning() {
        if (this.isDestroyed()) {
            return;
        }
        const collectionLength = this.collection.length;
        const count = this.collection.totalCount;

        if (count > collectionLength) {
            this.ui.warning[0].removeAttribute('hidden');
        } else {
            this.ui.warning[0].setAttribute('hidden', '');
        }
    }
});
