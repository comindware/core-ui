// @flow
import list from 'list';
import template from '../templates/panel.hbs';
import BubbleItemView from './BubbleItemView';

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
        return `dropdown__wrp dropdown__wrp_reference ${this.options.class || ''}`;
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            showAddNewButton: Boolean(this.options.addNewItem),
            showSelectedCollection: Boolean(this.options.selectedCollection),
            selectedTitle: this.options.selectedTitle,
            listTitle: this.options.listTitle
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
        return this.options.addNewItem ?
            {
                'click @ui.addNewButton': this.options.addNewItem
            } :
            undefined;
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
            this.selected = list.factory.createDefaultList({
                collection: selectedCollection,
                listViewOptions: {
                    childView: BubbleItemView,
                    childViewOptions: this.options.bubbleItemViewOptions,
                    tagName: 'div',
                    disableKeydownHandler: true,
                    customHeight: true,
                    childHeight: config.SELECTED_CHILD_HEIGHT,
                    emptyView: null
                }
            });

            this.showChildView('selectedRegion', this.selected);
        }

        this.listView = list.factory.createDefaultList({
            collection: this.collection,
            listViewOptions: {
                class: 'datalist-panel_list',
                childView: this.options.listItemView,
                disableKeydownHandler: true,
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
            }
        });

        this.showChildView('listRegion', this.listView);

        this.__toggleExcessWarning();

        this.listenTo(this.listView, 'update:height', () => {
            this.trigger('change:content');
        });
        this.listenTo(this.collection, 'add reset update', _.debounce(this.__toggleExcessWarning, 0));

        this.toggleSelectable();
    },

    handleCommand(command) {
        switch (command) {
            case 'up':
                this.listView.moveCursorBy(-1, { shiftPressed: false });
                break;
            case 'down':
                this.listView.moveCursorBy(1, { shiftPressed: false });
                break;
            default:
                break;
        }
    },

    toggleSelectable(canAddItem = this.options.canAddItem()) {
        if (this.isAttached()) {
            this.getChildView('listRegion').$el.toggleClass(classes.DISABLE_SELECT, !canAddItem);
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
