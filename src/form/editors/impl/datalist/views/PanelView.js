// @flow
import list from 'list';
import template from '../templates/bubblePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';
import AddNewButtonView from './../../reference/views/AddNewButtonView';
import ElementsQuantityWarningView from './ElementsQuantityWarningView';

const config = {
    CHILD_HEIGHT: 25
};

const classes = {
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.View.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.showAddNewButton = this.options.showAddNewButton;
    },

    className: 'dropdown__wrp dropdown__wrp_reference',

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
        const collection = this.model.get('collection');

        this.listView = list.factory.createDefaultList({
            collection,
            listViewOptions: {
                childView: this.options.listItemView,
                childViewOptions: {
                    reqres: this.reqres,
                    getDisplayText: this.options.getDisplayText,
                    showCheckboxes: this.options.showCheckboxes
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
        this.__toggleElementsQuantityWarning(collection.length, collection.totalCount);

        this.listenTo(this.listView, 'update:height', () => {
            this.__toggleElementsQuantityWarning(collection.length, collection.totalCount);
            this.trigger('change:content');
        });
        this.listenTo(collection, 'add reset update', () => this.__toggleElementsQuantityWarning(collection.length, collection.totalCount));
    },

    handleCommand(command) {
        switch (command) {
            case 'up':
                this.listView.moveCursorBy(-1, false);
                break;
            case 'down':
                this.listView.moveCursorBy(1, false);
                break;
            default:
                break;
        }
    },

    __toggleElementsQuantityWarning(collectionLength, count) {
        const warningRegion = this.getRegion('elementsQuantityWarningRegion');

        if (warningRegion) {
            count > collectionLength ? warningRegion.$el.show() : warningRegion.$el.hide();
        }
    }
});
