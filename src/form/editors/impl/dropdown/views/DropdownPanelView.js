
import template from '../templates/dropdownPanel.hbs';
import DefaultDropdownListItemView from './DefaultDropdownListItemView';
import DropdownCollection from '../collections/DropdownCollection';
import list from 'list';
import { helpers } from 'utils';

const config = {
    CHILD_HEIGHT: 25,
    MAX_HEIGHT: 410
};

const classes = {
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'model');
        helpers.ensureOption(options, 'reqres');

        this.rowHeight = options.rowHeight || config.CHILD_HEIGHT;

        this.reqres = options.reqres;
    },

    className: 'dd-list',

    template: Handlebars.compile(template),

    events: {
        'keyup @ui.input': 'onFilter',
        'change @ui.input': 'onFilter',
        'input @ui.input': 'onFilter'
    },


    ui: {
        input: '.js-input'
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region'
    },

    attributes: {
        tabindex: 0
    },

    templateContext() {
        return {
            enableSearch: this.options.enableSearch
        };
    },

    onRender() {
        if (this.options.enableSearch) {
            this.$el.addClass('dd-list_search');
        }
        const displayAttribute = this.model.get('displayAttribute');
        let virtualCollection = this.model.get('virtualCollection');
        if (!virtualCollection) {
            const collection = this.model.get('collection');
            if (collection.comparator === undefined) {
                collection.comparator = model => (_.result(model.toJSON(), displayAttribute) || '').toString().toLowerCase();
            }

            if (collection.comparator) {
                collection.sort();
            }
            virtualCollection = new DropdownCollection(collection, {
                comparator: collection.comparator
            });
            this.model.set('virtualCollection', virtualCollection);
        } else {
            virtualCollection.deselect();
        }
        const valueModel = this.model.get('value');
        if (valueModel) {
            valueModel.select();
        }

        const result = list.factory.createDefaultList({
            collection: virtualCollection,
            listViewOptions: {
                childView: DefaultDropdownListItemView,
                childViewOptions: {
                    reqres: this.reqres,
                    displayAttribute: this.model.get('displayAttribute')
                },
                emptyViewOptions: {
                    className: classes.EMPTY_VIEW
                },
                maxRows: Math.floor(config.MAX_HEIGHT / this.rowHeight),
                height: 'auto',
                childHeight: this.rowHeight
            }
        });

        this.listView = result.listView;
        this.eventAggregator = result.eventAggregator;

        this.listRegion.show(result.listView);
        this.scrollbarRegion.show(result.scrollbarView);

        this.$el.focus();
    },

    keyboardShortcuts: {
        'enter,num_enter,tab'() {
            if (this.isLoading) {
                return;
            }
            const selectedModel = this.model.get('virtualCollection').selected;
            this.reqres.request('value:set', selectedModel);
        },
        esc() {
            this.trigger('cancel');
        }
    },

    onFilter() {
        let text = (this.ui.input.val() || '').trim();
        if (this.activeText === text) {
            return;
        }
        helpers.setUniqueTimeout(this.fetchDelayId, () => {
            this.activeText = text;
            const collection = this.model.get('virtualCollection');
            collection.deselect();

            text = text.toLocaleLowerCase();
            collection.unhighlight();
            if (text === '') {
                collection.filter(null);
            } else {
                collection.filter(model => {
                    const itemText = (model.get(this.model.get('displayAttribute')) || '').toLocaleLowerCase();
                    return itemText.indexOf(text) !== -1;
                });
                collection.highlight(text);
            }

            if (collection.length > 0) {
                const model = collection.at(0);
                model.select();
            }
        }, config.TEXT_FETCH_DELAY);
    }
});
