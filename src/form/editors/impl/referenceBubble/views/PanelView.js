
import { Handlebars } from 'lib';
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
    },

    className: 'dd-list dd-list_reference',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            showAddNewButton: this.showAddNewButton
        };
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region',
        loadingRegion: '.js-loading-region',
        addNewButtonRegion: '.js-add-new-button-region',
        listTitleRegion: '.js-list-title-region',
        elementsQuantityWarningRegion: '.js-elements-quantity-warning-region'
    },

    onRender() {
        const result = list.factory.createDefaultList({
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
                childHeight: config.CHILD_HEIGHT
            }
        });

        this.listView = result.listView;
        this.eventAggregator = result.eventAggregator;

        if (this.showAddNewButton) {
            this.$el.addClass('dd-list_reference-button');
            const addNewButton = new AddNewButtonView({ reqres: this.reqres });
            this.showChildView('addNewButtonRegion', addNewButton);
        }

        this.showChildView('listRegion', result.listView);

        this.showChildView('scrollbarRegion', result.scrollbarView);

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

            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.__updateFilter(true);
                return;
            }

            const selectedModel = this.model.get('collection').selected;
            this.reqres.trigger('value:set', selectedModel);
        },
        esc() {
            this.trigger('cancel');
        }
    },

    updateFilter(value, immediate) {
        const text = (value || '').trim();
        if (this.activeText === text) {
            return;
        }
        const updateNow = () => {
            this.activeText = text;
            this.__setLoading(true);
            const collection = this.model.get('collection');
            this.reqres.trigger('filter:text', {
                text
            }).then(() => {
                if (collection.length > 0 && this.model.get('value')) {
                    this.model.get('value').forEach(model => {
                        if (collection.has(model.id)) {
                            collection.get(model.id).select();
                        }
                    });
                    this.__toggleElementsQuantityWarning(collection.totalCount);
                }
                this.__setLoading(false);
                this.reqres.trigger('view:ready');
            }).catch(e => {
                console.log(e.message);
            });
        };
        if (immediate) {
            updateNow();
        } else {
            const updateWithDelay = _.debounce(updateNow, this.options.textFilterDelay);
            updateWithDelay();
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
            this.getRegion('loadingRegion').reset();
        }
    },

    __toggleElementsQuantityWarning(count) {
        if (this.elementsQuantityWarningRegion) {
            count > 100
                ? this.getRegion('elementsQuantityWarningRegion').$el.show()
                : this.getRegion('elementsQuantityWarningRegion').$el.hide();
        }
    }
});
