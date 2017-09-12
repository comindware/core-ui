/**
 * Developer: Ksenia Kartvelishvili
 * Date: 30.08.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { keypress, Handlebars } from 'lib';
import { helpers } from 'utils';
import list from 'list';
import template from '../templates/referenceBubblePanel.hbs';
import LocalizationService from '../../../../../services/LocalizationService';
import LoadingView from './LoadingView';
import AddNewButtonView from './AddNewButtonView';
//import ReferenceBubblePanelTitleView from './ReferenceBubblePanelTitleView';

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
        this.fetchDelayId = _.uniqueId('fetch-delay-id-');
        this.timeoutId = null;
    },

    className: 'dd-list dd-list_reference',

    template: Handlebars.compile(template),

    templateHelpers() {
        return {
            showAddNewButton: this.showAddNewButton
        };
    },

    ui: {
        input: '.js-input'
    },

    events: {
        'keyup @ui.input': '__onTextChange',
        'change @ui.input': '__onTextChange',
        'input @ui.input': '__onTextChange',
        'click @ui.clear': '__clear'
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region',
        loadingRegion: '.js-loading-region',
        addNewButtonRegion: '.js-add-new-button-region',
        listTitleRegion: '.js-list-title-region'
    },

    onRender() {
        this.__assignKeyboardShortcuts();
    },

    onShow() {
        // const panelTitleView = new ReferenceBubblePanelTitleView({
        //     model: this.model,
        //     reqres: this.reqres,
        //     getDisplayText: this.options.getDisplayText
        // });
        // this.listTitleRegion.show(panelTitleView);

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

        this.__updateFilter(true);
    },

    __assignKeyboardShortcuts() {
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.ui.input[0]);
        _.each(this.keyboardShortcuts, function(value, key) {
            const keys = key.split(',');
            _.each(keys, function(k) {
                this.keyListener.simple_combo(k, value.bind(this));
            }, this);
        }, this);
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

    __onTextChange() {
        this.__updateFilter(false);
    },

    __updateFilter(immediate) {
        const text = (this.ui.input.val() || '').trim();
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
                this.timeoutId = null;
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
            this.timeoutId = helpers.setUniqueTimeout(this.fetchDelayId, updateNow, this.options.textFilterDelay);
        }
    },

    __setLoading(isLoading) {
        if (this.isDestroyed) {
            return;
        }
        this.isLoading = isLoading;
        if (isLoading) {
            this.loadingRegion.show(new LoadingView());
            this.ui.input.blur();
        } else {
            this.ui.input.focus();
            this.loadingRegion.reset();
        }
    }
});
