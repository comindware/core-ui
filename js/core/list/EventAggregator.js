/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';

/*
    Behavior-like controller that is responsible for synchronization between views presenting the same collection.

    For example, it keeps current scroll position in sync so that all the views are scrolled to the same item.

    Does not provide any public interface for now since all the behavior logic is inside.

    Usage:

    new EventAggregator({
        views: [
            scrollbarView,
            listView,
            // etc
        ]
    });
 */

export default Marionette.Controller.extend({
    initialize: function (options) {
        if (options.views === undefined) {
            throw new Error('You must pass the views you want to keep in sync (displaying the same collection) into the `views` option.');
        }
        if (!options.collection) {
            throw new Error('`collection` option is required.');
        }

        _.bindAll(this, '__handleCollectionAdd', '__handleCollectionRemove', '__handleCollectionReset');

        this.views = options.views;
        this.collection = options.collection;
        this.state = {};

        this.listenTo(this.collection, 'add', this.__handleCollectionAdd);
        this.listenTo(this.collection, 'remove', this.__handleCollectionRemove);
        this.listenTo(this.collection, 'reset', this.__handleCollectionReset);
        this.__updateCount(this.collection.length);

        _.each(this.views, function (v) {
            this.listenTo(v, 'viewportHeightChanged', this.__handleViewportHeightChanged);
            this.listenTo(v, 'positionChanged', this.__handlePositionChanged);
        }, this);
    },

    __handleCollectionAdd: function (model, collection) {
        this.__updateCount(collection.length);
    },

    __handleCollectionRemove: function (model, collection) {
        this.__updateCount(collection.length);
    },

    __handleCollectionReset: function (collection) {
        this.__updateCount(collection.length);
    },

    scrollTo: function (model) {
        var modelIndex = this.collection.indexOf(model);
        var view = _.find(this.views, function (view) {
            return view.scrollTo;
        });
        if (view) {
            view.scrollTo(modelIndex);
        }
    },

    __updateCount: function (count)
    {
        this.state.count = count;
    },

    __handleViewportHeightChanged: function (sender, e) {
        console.log('viewportHeight changed: ', e.oldViewportHeight, '->', e.viewportHeight);
        _.chain(this.views).filter(function (v) {
            return v !== sender;
        }).each(function (v) {
            v.updateViewportHeight && v.updateViewportHeight(e.viewportHeight);
        });
        this.state.viewportHeight = e.viewportHeight;
    },

    __handlePositionChanged: function (sender, e) {
        console.log('position changed: ', e.oldPosition, '->', e.position);
        _.chain(this.views).filter(function (v) {
            return v !== sender;
        }).each(function (v) {
            v.updatePosition && v.updatePosition(e.position);
        });
        this.state.position = e.position;
        this.__tryMoreDataRequest();
    },

    __tryMoreDataRequest: function ()
    {
        if (this.state.position === this.__getMaxPosition()) {
            if (!this.atEnd) {
                this.atEnd = true;
                this.trigger('request:moreData', this, this.collection);
            }
        } else {
            this.atEnd = false;
        }
    },

    __getMaxPosition: function ()
    {
        return Math.max(0, (this.state.count - 1) - this.state.viewportHeight + 1);
    }
});
