
import list from 'list';
import dropdown from 'dropdown';
import { helpers } from 'utils';
import template from '../templates/panel.hbs';
import ListItemView from './ListItemView';

const config = {
    CHILD_HEIGHT: 34,
    TEXT_FETCH_DELAY: 300
};

const classes = {
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'model');
        helpers.ensureOption(options, 'reqres');

        this.reqres = options.reqres;

        this.fetchDelayId = _.uniqueId('fetch-delay-id-');
    },

    className: 'dd-list',

    template: Handlebars.compile(template),

    ui: {
        input: '.js-input'
    },

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor'
        }
    },

    events: {
        'keyup @ui.input': '__updateFilter',
        'change @ui.input': '__updateFilter',
        'input @ui.input': '__updateFilter'
    },

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region',
        loadingRegion: '.js-loading-region'
    },

    onRender() {
        const result = list.factory.createDefaultList({
            collection: this.model.get('collection'),
            listViewOptions: {
                childView: ListItemView,
                childViewOptions: {
                    reqres: this.reqres
                },
                emptyViewOptions: {
                    className: classes.EMPTY_VIEW
                },
                childHeight: config.CHILD_HEIGHT,
                height: 'auto',
                maxRows: 10
            }
        });

        this.listView = result.listView;
        this.eventAggregator = result.eventAggregator;

        this.showChildView('listRegion', result.listView);
        this.showChildView('scrollbarRegion', result.scrollbarView);

        this.ui.input.focus();
        this.__updateFilter();
    },

    keyboardShortcuts: { //todo use this
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
            const selectedModel = this.model.get('collection').selected;
            this.reqres.trigger('value:set', selectedModel.id);
        },
        esc() {
            this.trigger('cancel');
        }
    },

    __updateFilter() {
        const text = (this.ui.input.val() || '').trim();
        if (this.activeText === text) {
            return;
        }
        helpers.setUniqueTimeout(this.fetchDelayId, () => {
            this.activeText = text;
            const collection = this.model.get('collection');
            collection.deselect();
            this.reqres.trigger('filter:text', {
                text
            }).then(() => {
                if (collection.length > 0) {
                    const model = collection.at(0);
                    model.select();
                    this.eventAggregator.scrollTo(model);
                }
            });
        }, config.TEXT_FETCH_DELAY);
    }
});
