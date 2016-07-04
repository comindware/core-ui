/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { keypress } from '../../libApi';
import { helpers, htmlHelpers } from '../../utils/utilsApi';
import template from '../templates/list.hbs';
import SlidingWindowCollection from '../../collections/SlidingWindowCollection';

/*
    Public interface:

    This view produce:
        trigger: positionChanged (sender, { oldPosition, position })
        trigger: viewportHeightChanged (sender, { oldViewportHeight, viewportHeight })
    This view react on:
        collection change (via Backbone.Collection events)
        position change (when we scroll with scrollbar for example): updatePosition(newPosition)
 */

let config = {
    VISIBLE_COLLECTION_RESERVE: 5,
    VISIBLE_COLLECTION_AUTOSIZE_RESERVE: 100
};

let VisibleCollectionView = Marionette.CollectionView.extend({
    getChildView: function(child) {
        if (child.get('isLoadingRowModel'))
        {
            return this.getOption('loadingChildView');
        }

        var childViewSelector = this.getOption('childViewSelector');
        if (childViewSelector) {
            return childViewSelector(child);
        }

        var childView = this.getOption('childView');
        if (!childView) {
            helpers.throwInvalidOperationError('ListView: you must specify either \'childView\' or \'childViewSelector\' option.');
        }
        return childView;
    }
});

let heightOptions = {
    AUTO: 'auto',
    FIXED: 'fixed'
};

let defaultOptions = {
    height: heightOptions.FIXED
};

/**
 * Some description for initializer
 * @name ListView
 * @memberof module:core.list.views
 * @class ListView
 * @constructor
 * @description View контента списка
 * @extends Marionette.LayoutView
 * @param {Object} options Constructor options
 * @param {Array} options.collection массив элементов списка
 * @param {Number} options.childHeight высота строки списка (childView)
 * @param {Backbone.View} options.childView view строки списка
 * @param {Backbone.View} options.childViewOptions опции для childView
 * @param {Function} options.childViewSelector ?
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк)
 * @param {Object} [options.emptyViewOptions] опции для emptyView
 * @param {String} options.height задает как определяется высота строки, значения: fixed, auto
 * @param {Backbone.View} options.loadingChildView view-лоадер, показывается при подгрузке строк
 * @param {Number} options.maxRows максимальное количество отображаемых строк (используется с опцией height: auto)
 * @param {Boolean} options.useDefaultRowView использовать RowView по умолчанию. В случае, если true - обязательно
 * должны быть указаны cellView для каждой колонки.
 * */
let ListView = Marionette.LayoutView.extend({
    initialize: function (options) {
        if (this.collection === undefined) {
            helpers.throwInvalidOperationError('ListView: you must specify a \'collection\' option.');
        }

        if (options.childHeight === undefined) {
            helpers.throwInvalidOperationError('ListView: you must specify a \'childHeight\' option - ' +
                'outer height for childView view (in pixels).');
        }

        _.bindAll(this, '__handleResize');

        this.$window = $(window);
        this.$window.on('resize', this.__handleResize);

        this.__createReqres();

        this.childViewOptions = _.extend(options.childViewOptions || {}, {
            internalListViewReqres: this.internalReqres
        });

        options.emptyView && (this.emptyView = options.emptyView); // jshint ignore:line
        options.emptyViewOptions && (this.emptyViewOptions = options.emptyViewOptions); // jshint ignore:line
        options.childView && (this.childView = options.childView); // jshint ignore:line
        options.childViewSelector && (this.childViewSelector = options.childViewSelector); // jshint ignore:line
        options.loadingChildView && (this.loadingChildView = options.loadingChildView);// jshint ignore:line
        this.handleResizeUniqueId = _.uniqueId();
        this.maxRows = options.maxRows;
        this.height = options.height;

        if (options.height === undefined) {
            this.height = defaultOptions.height;
        }

        this.childHeight = options.childHeight;
        this.state = {
            position: 0
        };

        this.listenTo(this.collection, 'add remove reset', this.__handleResize, this);
        this.visibleCollection = new SlidingWindowCollection(this.collection);
    },

    regions: {
        visibleCollectionRegion: '.visible-collection-view'
    },

    events: {
        'mousewheel': '__mousewheel'
    },

    className: 'list',
    template: template,

    onDestroy: function () {
        this.$window.off('resize', this.__handleResize);
    },

    onShow: function () {
        // Updating viewportHeight and rendering subviews
        this.__handleResizeInternal();
        this.visibleCollectionView = new VisibleCollectionView({
            childView: this.childView,
            childViewSelector: this.childViewSelector,
            className: 'visible-collection',
            collection: this.visibleCollection,
            emptyView: this.emptyView,
            emptyViewOptions: this.emptyViewOptions,
            childViewOptions: this.childViewOptions,
            loadingChildView: this.loadingChildView
        });

        this.visibleCollectionRegion.show(this.visibleCollectionView);
    },

    onRender: function () {
        htmlHelpers.forbidSelection(this.el);
        this.__assignKeyboardShortcuts();
    },

    keyboardShortcuts: {
        'up': function (e) {
            this.moveCursorBy(-1, e.shiftKey);
        },
        'down': function (e) {
            this.moveCursorBy(+1, e.shiftKey);
        },
        'pageup': function (e) {
            var delta = Math.ceil(this.state.viewportHeight * 0.8);
            this.moveCursorBy(-delta, e.shiftKey);
        },
        'pagedown': function (e) {
            var delta = Math.ceil(this.state.viewportHeight * 0.8);
            this.moveCursorBy(delta, e.shiftKey);
        },
        'home': function (e) {
            this.__moveCursorTo(0, e.shiftKey);
        },
        'end': function (e) {
            this.__moveCursorTo(this.collection.length - 1, e.shiftKey);
        }
    },

    __createReqres: function () {
        this.internalReqres = new Backbone.Wreqr.RequestResponse();
        this.internalReqres.setHandler('childViewEvent', this.__handleChildViewEvent, this);
    },

    __handleChildViewEvent: function (view, eventName, eventArguments) {
        this.trigger.apply(this, [ 'childview:' + eventName, view ].concat(eventArguments));
    },

    __moveCursorTo: function (newCursorIndex, shiftPressed)
    {
        var cid = this.collection.cursorCid;
        var index = 0;
        this.collection.find(function (x, i) {
            if (x.cid === cid) {
                index = i;
                return true;
            }
        });

        var nextIndex = this.__normalizeCollectionIndex(newCursorIndex);
        if (nextIndex !== index) {
            var model = this.collection.at(nextIndex);
            var selectFn = this.collection.selectSmart || this.collection.select;
            if (selectFn) {
                selectFn.call(this.collection, model, false, shiftPressed);
            }
            this.scrollTo(nextIndex);
        }
    },

    // Move the cursor to a new position [cursorIndex + positionDelta] (like when user changes selected item using keyboard)
    moveCursorBy: function (cursorIndexDelta, shiftPressed)
    {
        var cid = this.collection.cursorCid;
        var index = 0;
        this.collection.find(function (x, i) {
            if (x.cid === cid) {
                index = i;
                return true;
            }
        });

        var nextIndex = this.__normalizeCollectionIndex(index + cursorIndexDelta);
        if (nextIndex !== index) {
            var model = this.collection.at(nextIndex);
            var selectFn = this.collection.selectSmart || this.collection.select;
            if (selectFn) {
                selectFn.call(this.collection, model, false, shiftPressed);
            }
            this.scrollTo(nextIndex);
        }
    },

    scrollTo: function (index)
    {
        var indexDelta = index - this.state.position;
        var criticalOffset = 2;
        if (indexDelta < criticalOffset || indexDelta > this.state.viewportHeight - criticalOffset) {
            var centerItemDelta = Math.floor(this.state.viewportHeight / 2 - 1);
            var newPosition = this.state.position + indexDelta - centerItemDelta;
            this.__updatePositionInternal(newPosition, true);
        }
    },

    __normalizePosition: function (position)
    {
        var maxPos = Math.max(0, (this.collection.length - 1) - this.state.viewportHeight + 1);
        return Math.max(0, Math.min(maxPos, position));
    },

    // normalized the index so that it fits in range [0, this.collection.length - 1]
    __normalizeCollectionIndex: function (index)
    {
        return Math.max(0, Math.min(this.collection.length - 1, index));
    },

    __assignKeyboardShortcuts: function ()
    {
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.el);
        _.each(this.keyboardShortcuts, function (value, key) //noinspection JSHint
        {
            if (typeof value === 'object') {
                this.keyListener.register_combo(_.extend({
                    'keys': key,
                    'this': this
                }, value));
            } else {
                this.keyListener.simple_combo(key, value.bind(this));
            }
        }, this);
    },

    updatePosition: function (newPosition)
    {
        this.__updatePositionInternal(newPosition, false);
    },

    __updatePositionInternal: function (newPosition, triggerEvents)
    {
        if (this.state.viewportHeight === undefined) {
            helpers.throwInvalidOperationError('ListView: updatePosition() has been called before the full initialization of the view.');
        }

        newPosition = this.__normalizePosition(newPosition);
        if (newPosition === this.state.position) {
            return;
        }

        newPosition = this.visibleCollection.updatePosition(newPosition);
        var oldPosition = this.state.position;
        this.state.position = newPosition;
        if (triggerEvents) {
            this.trigger('positionChanged', this, {
                oldPosition: oldPosition,
                position: newPosition
            });
        }

        return newPosition;
    },

    __handleResize: function () {
        helpers.setUniqueTimeout(this.handleResizeUniqueId, this.__handleResizeInternal.bind(this), 100);
    },

    // Updates state.viewportHeight and visibleCollection.state.windowSize.
    __handleResizeInternal: function () {
        var oldViewportHeight = this.state.viewportHeight;
        var elementHeight = this.$el.height();

        // Checking options consistency
        if (this.height === heightOptions.FIXED && elementHeight === 0) {
            helpers.throwInvalidOperationError(
                'ListView configuration error: ' +
                'fixed-height ListView (with option height: fixed) MUST be placed inside an element with computed height != 0.');
        } else if (this.height === heightOptions.AUTO && !_.isFinite(this.maxRows)) {
            helpers.throwInvalidOperationError(
                'ListView configuration error: you have passed option height: AUTO into ListView control but didn\'t specify maxRows option.');
        }

        // Computing new elementHeight and viewportHeight
        var adjustedElementHeight = this.getAdjustedElementHeight(elementHeight);
        this.state.viewportHeight = Math.max(1, Math.floor(adjustedElementHeight / this.childHeight));
        var visibleCollectionSize = this.state.viewportHeight + config.VISIBLE_COLLECTION_RESERVE;

        // Applying the result of computation
        if (this.state.viewportHeight === oldViewportHeight && adjustedElementHeight === elementHeight) {
            // nothing changed
            return;
        }

        this.$el.height(adjustedElementHeight);
        this.visibleCollection.updateWindowSize(visibleCollectionSize);

        this.trigger('viewportHeightChanged', this, {
            oldViewportHeight: oldViewportHeight,
            viewportHeight: this.state.viewportHeight,
            listViewHeight: adjustedElementHeight
        });
    },

    getAdjustedElementHeight: function (elementHeight) {
        if (this.height !== heightOptions.AUTO) {
            return elementHeight;
        }

        var computedViewportHeight = Math.min(this.maxRows, this.collection.length),
            minHeight = 0,
            outerBoxAdjustments = 0;

        if (this.visibleCollectionView && this.visibleCollectionView.isEmpty()) {
            minHeight = this.visibleCollectionView.$el.find('.empty-view').height();
        }

        if (this.visibleCollectionView) {
            outerBoxAdjustments = this.visibleCollectionView.$el.outerHeight() % this.childHeight;
        }

        return Math.max(this.childHeight * computedViewportHeight + outerBoxAdjustments, minHeight);
    },

    __mousewheel: function (e) {
        if (this.state.viewportHeight === undefined) {
            return;
        }
        if (this.collection.length <= this.state.viewportHeight) {
            return;
        }

        var delta = this.state.viewportHeight;
        var newPosition = this.state.position - e.deltaY * Math.max(1, Math.floor(delta / 6));
        this.__updatePositionInternal(newPosition, true);
        return false;
    }
});

export default ListView;
