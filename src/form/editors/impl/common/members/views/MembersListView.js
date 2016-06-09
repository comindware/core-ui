/**
 * Developer: Ksenia Kartvelishvili
 * Date: 20.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { helpers } from '../../../../../../utils/utilsApi';
import '../../../../../../libApi';
import list from '../../../../../../list/listApi';
import template from '../templates/panel.hbs';
import ListItemView from './MembersListItemView';

let config = {
    CHILD_HEIGHT: 34
};

export default Marionette.LayoutView.extend({
    initialize: function (options) {
        helpers.ensureOption(options, 'collection');
    },

    template: template,

    className: 'dev-members-container',

    regions: {
        listRegion: '.js-list-region',
        scrollbarRegion: '.js-scrollbar-region'
    },

    onShow: function () {
        this.listBundle = list.factory.createDefaultList({
            collection: this.collection,
            listViewOptions: {
                childView: ListItemView,
                childViewOptions: {
                    reqres: this.reqres
                },
                childHeight: config.CHILD_HEIGHT,
                height: 'auto',
                maxRows: 12
            }
        });

        this.listenTo(this.listBundle.listView, 'childview:member:select', function (view, model) {
            this.trigger('member:select', model);
        }.bind(this));

        this.listRegion.show(this.listBundle.listView);
        this.scrollbarRegion.show(this.listBundle.scrollbarView);
    },

    handleCommand: function(command, options) {
        switch (command) {
        case 'up':
            this.listBundle.listView.moveCursorBy(-1, false);
            break;
        case 'down':
            this.listBundle.listView.moveCursorBy(1, false);
            break;
        }
    }
});
