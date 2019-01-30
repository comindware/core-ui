// @flow
import list from 'list';
import template from '../templates/bubblePanel.hbs';

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
        }
    },

    events() {
        return this.options.showAddNewButton ?
            {
                'click @ui.addNewButton': () => this.reqres.request('add:new:item')
            } :
            undefined;
    },

    ui: {
        addNewButton: '.js-add-new',
        warning: '.js-warning'
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

        if (typeof this.options.canSelect === 'function') {
            this.__changeSelected();
            this.listenTo(this.collection, 'selected deselected', this.__changeSelected);
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
