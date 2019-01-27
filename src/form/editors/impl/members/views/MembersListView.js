import { helpers } from 'utils';
import list from 'list';
import template from '../templates/panel.hbs';
import ListItemView from './MembersListItemView';

const config = {
    CHILD_HEIGHT: 34
};

const classes = {
    EMPTY_VIEW: 'editor__common-empty-view'
};

export default Marionette.View.extend({
    initialize(options) {
        helpers.ensureOption(options, 'collection');
    },

    template: Handlebars.compile(template),

    className: 'dd-list',

    regions: {
        listRegion: '.js-list-region'
    },

    onAttach() {
        this.listView = list.factory.createDefaultList({
            collection: this.options.collection,
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
                maxRows: 12
            }
        });

        this.listenTo(this.listView, 'childview:member:select', (view, model) => {
            this.trigger('member:select', model);
        });

        this.showChildView('listRegion', this.listView);
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
    }
});
