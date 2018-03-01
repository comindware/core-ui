/**
 * Developer: Stepan Burguchev
 * Date: 7/7/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { keypress, Handlebars } from 'lib';
import { helpers, htmlHelpers } from 'utils';
import template from '../templates/list.hbs';
import SlidingWindowCollection from '../../collections/SlidingWindowCollection';
import GlobalEventService from '../../services/GlobalEventService';

/*
    Public interface:

    This view produce:
        trigger: positionChanged (sender, { oldPosition, position })
        trigger: viewportHeightChanged (sender, { oldViewportHeight, viewportHeight })
    This view react on:
        collection change (via Backbone.Collection events)
        position change (when we scroll with scrollbar for example): updatePosition(newPosition)
 */

const config = {
    VISIBLE_COLLECTION_RESERVE: 10,
    VISIBLE_COLLECTION_AUTOSIZE_RESERVE: 100
};

// const VisibleCollectionView = Marionette.CollectionView.extend({
//     getChildView(child) {
//         if (child.get('isLoadingRowModel')) {
//             return this.getOption('loadingChildView');
//         }
//
//         const childViewSelector = this.getOption('childViewSelector');
//         if (childViewSelector) {
//             return childViewSelector(child);
//         }
//
//         const childView = this.getOption('childView');
//         if (!childView) {
//             helpers.throwInvalidOperationError('ListView: you must specify either \'childView\' or \'childViewSelector\' option.');
//         }
//         return childView;
//     }
// });

const heightOptions = {
    AUTO: 'auto',
    FIXED: 'fixed'
};

const defaultOptions = {
    height: heightOptions.FIXED,
    maxRows: 100,
    defaultElHeight: 300
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
 * @param {Boolean} options.forbidSelection запретить выделять элементы списка при помощи мыши
 * должны быть указаны cellView для каждой колонки.
 * */
const ListView = Marionette.CompositeView.extend({
    initialize(options) {
        if (this.collection === undefined) {
            helpers.throwInvalidOperationError('ListView: you must specify a \'collection\' option.');
        }

        if (options.childHeight === undefined) {
            helpers.throwInvalidOperationError('ListView: you must specify a \'childHeight\' option - ' +
                'outer height for childView view (in pixels).');
        }

        this.__createReqres();

        this.childViewOptions = _.extend(options.childViewOptions || {}, {
            internalListViewReqres: this.internalReqres
        });

        this.parentCollection = this.collection;

        options.emptyView && (this.emptyView = options.emptyView);
        options.emptyViewOptions && (this.emptyViewOptions = options.emptyViewOptions);
        options.childView && (this.childView = options.childView);
        options.childViewSelector && (this.childViewSelector = options.childViewSelector);
        options.loadingChildView && (this.loadingChildView = options.loadingChildView);
        this.maxRows = options.maxRows || defaultOptions.maxRows;
        this.height = options.height;
        this.forbidSelection = _.isBoolean(options.forbidSelection) ? options.forbidSelection : true;

        if (options.height === undefined) {
            this.height = defaultOptions.height;
        }

        this.childHeight = options.childHeight;
        this.state = {
            position: 0
        };

        _.bindAll(this, 'handleResize');
        const debouncedHandleResize = _.debounce(this.handleResize, 100);
        this.listenTo(GlobalEventService, 'resize', debouncedHandleResize);
        this.listenTo(this.parentCollection, 'add remove reset', debouncedHandleResize);

        this.collection = new SlidingWindowCollection(this.collection);
        this.oldScrollTop = 0;
    },

    regions: {
        visibleCollectionRegion: '.visible-collection-view'
    },

    childViewContainer: '.js-visible-collection-container',

    ui: {
        visibleCollection: '.js-visible-collection-container',
    },

    events: {
        scroll: '__onScroll',
    },

    className: 'list',

    template: Handlebars.compile(template),

    onShow() {
        // Updating viewportHeight and rendering subviews
        this.collection.updateWindowSize(1);
        this.handleResize();
        // this.visibleCollectionView = new VisibleCollectionView({
        //     childView: this.childView,
        //     childViewSelector: this.childViewSelector,
        //     className: 'visible-collection',
        //     collection: this.visibleCollection,
        //     emptyView: this.emptyView,
        //     emptyViewOptions: this.emptyViewOptions,
        //     childViewOptions: this.childViewOptions,
        //     loadingChildView: this.loadingChildView
        // });

        // this.visibleCollectionRegion.show(this.visibleCollectionView);
    },

    onRender() {
        if (this.forbidSelection) {
            htmlHelpers.forbidSelection(this.el);
        }
        this.__assignKeyboardShortcuts();
    },

    getChildView(child) {
        if (child.get('isLoadingRowModel')) {
            return this.getOption('loadingChildView');
        }

        const childViewSelector = this.getOption('childViewSelector');
        if (childViewSelector) {
            return childViewSelector(child);
        }

        const childView = this.getOption('childView');
        if (!childView) {
            helpers.throwInvalidOperationError('ListView: you must specify either \'childView\' or \'childViewSelector\' option.');
        }
        return childView;
    },

    keyboardShortcuts: {
        up(e) {
            this.moveCursorBy(-1, e.shiftKey);
        },
        down(e) {
            this.moveCursorBy(+1, e.shiftKey);
        },
        pageup(e) {
            const delta = Math.ceil(this.state.viewportHeight * 0.8);
            this.moveCursorBy(-delta, e.shiftKey);
        },
        pagedown(e) {
            const delta = Math.ceil(this.state.viewportHeight * 0.8);
            this.moveCursorBy(delta, e.shiftKey);
        },
        home(e) {
            this.__moveCursorTo(0, e.shiftKey);
        },
        end(e) {
            this.__moveCursorTo(this.parentCollection.length - 1, e.shiftKey);
        }
    },

    __createReqres() {
        this.internalReqres = new Backbone.Wreqr.RequestResponse();
        this.internalReqres.setHandler('childViewEvent', this.__handleChildViewEvent, this);
    },

    __handleChildViewEvent(view, eventName, eventArguments) {
        this.trigger.apply(this, [ `childview:${eventName}`, view ].concat(eventArguments));
    },

    __moveCursorTo(newCursorIndex, shiftPressed) {
        const cid = this.parentCollection.cursorCid;
        let index = 0;
        this.parentCollection.find((x, i) => {
            if (x.cid === cid) {
                index = i;
                return true;
            }
            return false;
        });

        const nextIndex = this.__normalizeCollectionIndex(newCursorIndex);
        if (nextIndex !== index) {
            const model = this.parentCollection.at(nextIndex);
            const selectFn = this.parentCollection.selectSmart || this.parentCollection.select;
            if (selectFn) {
                selectFn.call(this.parentCollection, model, false, shiftPressed);
            }
            this.scrollTo(nextIndex);
        }
    },

    // Move the cursor to a new position [cursorIndex + positionDelta] (like when user changes selected item using keyboard)
    moveCursorBy(cursorIndexDelta, shiftPressed) {
        const cid = this.parentCollection.cursorCid;
        let index = 0;
        this.parentCollection.find((x, i) => {
            if (x.cid === cid) {
                index = i;
                return true;
            }
            return false;
        });

        const nextIndex = this.__normalizeCollectionIndex(index + cursorIndexDelta);
        if (nextIndex !== index) {
            const model = this.parentCollection.at(nextIndex);
            const selectFn = this.parentCollection.selectSmart || this.parentCollection.select;
            if (selectFn) {
                selectFn.call(this.parentCollection, model, false, shiftPressed);
            }
            this.scrollTo(nextIndex);
        }
    },

    scrollTo(index) {
        const indexDelta = index - this.state.position;
        const criticalOffset = 2;
        if (indexDelta < criticalOffset || indexDelta > this.state.viewportHeight - criticalOffset) {
            const centerItemDelta = Math.floor(this.state.viewportHeight / 2 - 1);
            const newPosition = this.state.position + indexDelta - centerItemDelta;
            this.__updatePositionInternal(newPosition, true);
        }
    },

    __normalizePosition(position) {
        const maxPos = Math.max(0, this.parentCollection.length - this.state.visibleCollectionSize);
        return Math.max(0, Math.min(maxPos, position));
    },

    // normalized the index so that it fits in range [0, this.collection.length - 1]
    __normalizeCollectionIndex(index) {
        return Math.max(0, Math.min(this.parentCollection.length - 1, index));
    },

    __assignKeyboardShortcuts() {
        if (this.keyListener) {
            this.keyListener.reset();
        }
        this.keyListener = new keypress.Listener(this.el);
        _.each(this.keyboardShortcuts, (value, key) => {
            if (typeof value === 'object') {
                this.keyListener.register_combo(_.extend({
                    keys: key,
                    this: this
                }, value));
            } else {
                this.keyListener.simple_combo(key, value.bind(this));
            }
        });
    },

    updatePosition(newPosition) {
        this.__updatePositionInternal(newPosition, false);
    },

    __updatePositionInternal(position, triggerEvents) {
        let newPosition = position;
        newPosition = this.__normalizePosition(newPosition);
        if (newPosition === this.state.position) {
            return;
        }

        newPosition = this.collection.updatePosition(newPosition);
        this.state.position = newPosition;
        if (triggerEvents) {
            this.internalScroll = true;
            const scrollTop = Math.max(0, newPosition > (this.parentCollection.length - config.VISIBLE_COLLECTION_RESERVE) / 2
                ? newPosition + config.VISIBLE_COLLECTION_RESERVE
                : newPosition) * this.childHeight;
            this.el.scrollTop = scrollTop;
            _.delay(() => this.internalScroll = false, 100);
        }
        this.children.forEach(view => view.$el.css({
            top: this.parentCollection.indexOf(view.model) * this.childHeight,
            position: 'absolute'
        }));

        return newPosition;
    },

    // Updates state.viewportHeight and visibleCollection.state.windowSize.
    handleResize() {
        if (this.isDestroyed) {
            return;
        }
        const oldViewportHeight = this.state.viewportHeight;
        let elementHeight = this.$el.height();
        const adjustedElementHeight = this.getAdjustedElementHeight(elementHeight);
        if (!adjustedElementHeight) {
            _.delay(() => this.handleResize(), 100);
            return;
        }

        // Checking options consistency
        if (this.height === heightOptions.FIXED && elementHeight === 0) {
            elementHeight = defaultOptions.defaultElHeight;
        } else if (this.height === heightOptions.AUTO && !_.isFinite(this.maxRows)) {
            helpers.throwInvalidOperationError(
                'ListView configuration error: you have passed option height: AUTO into ListView control but didn\'t specify maxRows option.');
        }

        // Computing new elementHeight and viewportHeight
        if (this.children && this.children.length) {
            const firstChild = this.children.first().el;
            if (firstChild && firstChild.offsetHeight) {
                this.childHeight = firstChild.offsetHeight;
            }
            this.children.forEach(view => view.$el.css({
                top: this.parentCollection.indexOf(view.model) * this.childHeight,
                position: 'absolute'
            }));
        }
        this.state.viewportHeight = Math.max(1, Math.floor(adjustedElementHeight / this.childHeight));
        const visibleCollectionSize = this.state.visibleCollectionSize = this.state.viewportHeight + config.VISIBLE_COLLECTION_RESERVE;
        this.ui.visibleCollection.height(this.childHeight * this.parentCollection.length);

        // Applying the result of computation
        if (this.state.viewportHeight === oldViewportHeight && adjustedElementHeight === elementHeight) {
            // nothing changed
            return;
        }

        this.$el.height(adjustedElementHeight);
        this.collection.updateWindowSize(visibleCollectionSize);
    },

    getAdjustedElementHeight(elementHeight) {
        if (this.height !== heightOptions.AUTO) {
            return elementHeight;
        }

        const computedViewportHeight = Math.min(this.maxRows, this.parentCollection.length);
        let minHeight = 0;
        let outerBoxAdjustments = 0;

        if (this.isEmpty()) {
            minHeight = this.$el.find('.empty-view').height();
        }

        if (this.visibleCollectionView) {
            outerBoxAdjustments = this.visibleCollectionView.$el.outerHeight() % this.childHeight;
        }

        return Math.max(this.childHeight * computedViewportHeight + outerBoxAdjustments, minHeight);
    },

    __onScroll() {
        if (this.state.viewportHeight === undefined || this.parentCollection.length <= this.state.viewportHeight || this.internalScroll) {
            return;
        }
        const newPosition = Math.max(0, Math.floor(this.el.scrollTop / this.childHeight));
        this.__updatePositionInternal(newPosition, false);
        // return false;
    }
});

export default ListView;
