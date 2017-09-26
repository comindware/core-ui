/**
 * Developer: Ksenia Kartvelishvili
 * Date: 30.08.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import list from 'list';
import template from '../templates/bubblePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';
import LoadingView from './../../reference/views/LoadingView';
import AddNewButtonView from './../../reference/views/AddNewButtonView';

const config = {
    CHILD_HEIGHT: 25
};

const classes = {
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        this.reqres = options.reqres;
        this.showAddNewButton = this.options.showAddNewButton;
    },

    className: 'dd-list dd-list_reference',

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            showAddNewButton: this.showAddNewButton
        };
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region',
        loadingRegion: '.js-loading-region',
        addNewButtonRegion: '.js-add-new-button-region',
        listTitleRegion: '.js-list-title-region'
    },

    onShow() {
        const result = list.factory.createDefaultList({
            collection: this.model.get('collection'),
            listViewOptions: {
                childView: this.options.listItemView,
                childViewOptions: {
                    reqres: this.reqres,
                    getDisplayText: this.options.getDisplayText
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
            this.addNewButtonRegion.show(addNewButton);
        }

        this.listRegion.show(result.listView);

        this.scrollbarRegion.show(result.scrollbarView);

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
            this.reqres.request('value:set', selectedModel);
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
            collection.deselect();
            this.reqres.request('filter:text', {
                text
            }).then(() => {
                if (collection.length > 0) {
                    if (!collection.contains(collection.selected)) {
                        const model = collection.at(0);
                        model.select();
                    }
                }
                this.__setLoading(false);
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
            this.loadingRegion.show(new LoadingView());
        } else {
            this.loadingRegion.reset();
        }
    }
});
