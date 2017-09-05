/**
 * Developer: Stepan Burguchev
 * Date: 5/13/2015
 * Copyright: 2009-2015 Comindware�
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */


import template from '../templates/referencePanel.html';

const config = {
    CHILD_HEIGHT: 30,
    TEXT_FETCH_DELAY: 300
};

export default Marionette.LayoutView.extend({
    initialize(options) {
        this.reqres = options.reqres;

        this.fetchDelayId = _.uniqueId('fetch-delay-id-');
    },

    className: 'dd-list dd-list_reference dd-list_reference_panel',

    template: Handlebars.compile(template),

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region',
        loadingRegion: '.js-loading-region'
    },

    handleCommand(command, options) {
        switch (command) {
            case 'up':
                this.listView.moveCursorBy(-1, false);
                break;
            case 'down':
                this.listView.moveCursorBy(1, false);
                break;
            case 'filter':
                this.__filter(options.textFragment);
                break;
            default:
                break;
        }
    },

    onShow() {
        const result = Core.list.factory.createDefaultList({
            collection: this.model.get('collection'),
            listViewOptions: {
                childView: this.options.listItemView,
                childViewOptions: {
                    reqres: this.reqres,
                    getDisplayText: this.options.getDisplayText
                },
                childHeight: config.CHILD_HEIGHT
            }
        });

        this.listView = result.listView;
        this.eventAggregator = result.eventAggregator;

        this.listRegion.show(result.listView);
        this.scrollbarRegion.show(result.scrollbarView);

        this.__filter(null);
    },

    __filter(textFragment) {
        this.__setLoading(true);

        const collection = this.model.get('collection');
        collection.deselect();

        this.reqres.request('filter:text', {
            text: textFragment
        }).then(() => {
            if (collection.length > 0) {
                const model = collection.at(0);
                model.select();
                this.eventAggregator.scrollTo(model);
            }

            this.__setLoading(false);
        });
    },

    __setLoading(isLoading) {
        if (this.isDestroyed) {
            return false;
        }
        this.isLoading = isLoading;
        if (isLoading) {
            this.loadingRegion.show(new Core.form.editors.reference.views.LoadingView());
        } else {
            this.loadingRegion.reset();
        }
    }
});
