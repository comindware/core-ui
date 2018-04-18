// @flow
import list from 'list';
import template from '../templates/bubblePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';
import LoadingView from './../../reference/views/LoadingView';
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
        this.__updateWithDelay = _.debounce(this.__updateFilterNow, this.options.textFilterDelay);
        this.reqres.reply('try:value:select', this.__proxyValueSelect, this);
    },

    className: 'dropdown__wrp dropdown__wrp_reference',

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            showAddNewButton: this.showAddNewButton
        };
    },

    regions: {
        listRegion: '.js-list-region',
        loadingRegion: '.js-loading-region',
        addNewButtonRegion: '.js-add-new-button-region',
        listTitleRegion: '.js-list-title-region',
        elementsQuantityWarningRegion: '.js-elements-quantity-warning-region'
    },

    onAttach() {
        this.listView = list.factory.createDefaultList({
            collection: this.model.get('collection'),
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
        this.getRegion('elementsQuantityWarningRegion').$el.hide();
        this.updateFilter(null, true);
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

    keyboardShortcuts: {
        up() {
            this.listView.moveCursorBy(-1, false);
        },
        down() {
            this.listView.moveCursorBy(1, false);
        },
        'enter,num_enter,tab'() {
            if (this.isLoading) {
                return;
            }

            if (this.isFilterDeayed) {
                this.updateFilter(this.newSearchText, true);
                return;
            }

            const selectedModel = this.model.get('collection').selected;
            this.reqres.request('value:set', selectedModel);
        },
        esc() {
            this.trigger('cancel');
        }
    },

    updateFilter(value, immediate) {
        this.newSearchText = (value || '').trim();

        if (immediate) {
            this.__updateFilterNow();
        } else {
            this.isFilterDeayed = true;
            this.__updateWithDelay();
        }
    },

    __setLoading(isLoading) {
        if (this.isDestroyed) {
            return;
        }
        this.isLoading = isLoading;
        if (isLoading) {
            this.showChildView('loadingRegion', new LoadingView());
        } else {
            this.loadingRegion.reset();
        }
    },

    __toggleElementsQuantityWarning(count) {
        if (this.elementsQuantityWarningRegion) {
            count > 100 ? this.getRegion('elementsQuantityWarningRegion').$el.show() : this.getRegion('elementsQuantityWarningRegion').$el.hide();
        }
    },

    __updateFilterNow() {
        if (this.activeText === this.newSearchText) {
            return;
        }
        this.activeText = this.newSearchText;
        this.isFilterDeayed = false;
        this.__setLoading(true);
        const collection = this.model.get('collection');
        this.reqres
            .request('filter:text', {
                text: this.newSearchText
            })
            .then(() => {
                if (collection.length > 0 && this.model.get('value')) {
                    this.model.get('value').forEach(model => {
                        if (collection.has(model.id)) {
                            collection.get(model.id).select();
                        }
                    });
                    this.__toggleElementsQuantityWarning(collection.totalCount);
                }
                this.__setLoading(false);
                this.reqres.request('view:ready');
            })
            .catch(e => {
                console.log(e.message);
            });
    },

    __proxyValueSelect() {
        if (this.isFilterDeayed) {
            this.updateFilter(this.newSearchText, true);
        } else {
            this.reqres.request('value:select');
        }
    }
});
