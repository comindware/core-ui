// @flow
import list from 'list';
import template from '../templates/bubblePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';
import AddNewButtonView from './AddNewButtonView';
import ElementsQuantityWarningView from './ElementsQuantityWarningView';

const config = {
    CHILD_HEIGHT: 35
};

const classes = {
    DISABLE_SELECT: 'disable-select',
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.showAddNewButton = this.options.showAddNewButton;
    },

    className() {
        return `dropdown__wrp dropdown__wrp_reference ${this.options.class || ''}`;
    },

    template: Handlebars.compile(template),

    templateContext() {
        return {
            showAddNewButton: this.showAddNewButton
        };
    },

    regions: {
        listRegion: {
            el: '.js-list-region',
            replaceElement: true
        },
        addNewButtonRegion: '.js-add-new-button-region',
        listTitleRegion: '.js-list-title-region',
        elementsQuantityWarningRegion: '.js-elements-quantity-warning-region'
    },

    onAttach() {
        this.collection = this.getOption('collection');

        this.listView = list.factory.createDefaultList({
            collection: this.collection,
            listViewOptions: {
                class: 'datalist-panel_list',
                childView: this.options.listItemView,
                childViewOptions: {
                    reqres: this.reqres,
                    getDisplayText: this.options.getDisplayText,
                    subTextOptions: this.options.subTextOptions,
                    showCheckboxes: this.options.showCheckboxes,
                    canSelect: this.options.canSelect
                },
                emptyViewOptions: {
                    text: LocalizationService.get('CORE.FORM.EDITORS.REFERENCE.NOITEMS'),
                    className: classes.EMPTY_VIEW
                },
                selectOnCursor: false,
                childHeight: config.CHILD_HEIGHT
            }
        });

        if (this.showAddNewButton) {
            this.$el.addClass('dropdown__wrp_reference-button');
            const addNewButton = new AddNewButtonView({ reqres: this.reqres });
            this.showChildView('addNewButtonRegion', addNewButton);
        }
        this.showChildView('listRegion', this.listView);

        this.showChildView('elementsQuantityWarningRegion', new ElementsQuantityWarningView());
        this.__toggleElementsQuantityWarning(this.collection.length, this.collection.totalCount);

        this.listenTo(this.listView, 'update:height', () => {
            this.__toggleElementsQuantityWarning(this.collection.length, this.collection.totalCount);
            this.trigger('change:content');
        });
        this.listenTo(this.collection, 'add reset update', () => this.__toggleElementsQuantityWarning(this.collection.length, this.collection.totalCount));

        if (typeof this.options.canSelect === 'function') {
            this.__changeSelected();
            this.listenTo(this.collection, 'selected deselected', this.__changeSelected);
        }
    },

    onBeforeDestroy() {
        if (typeof this.options.canSelect === 'function') {
            this.stopListening(this.collection, 'selected deselected', this.__changeSelected);
        }
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

    __changeSelected() {
        if (this.isAttached()) {
            this.getChildView('listRegion').$el.toggleClass(classes.DISABLE_SELECT, !this.options.canSelect());
        }
    },

    __toggleElementsQuantityWarning(collectionLength, count) {
        const warningRegion = this.getRegion('elementsQuantityWarningRegion');

        if (warningRegion) {
            count > collectionLength ? warningRegion.$el.show() : warningRegion.$el.hide();
        }
    }
});
