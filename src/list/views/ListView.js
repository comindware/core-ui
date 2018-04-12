import { keyCode, helpers, htmlHelpers } from 'utils';
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
    VISIBLE_COLLECTION_RESERVE: 20,
    VISIBLE_COLLECTION_AUTOSIZE_RESERVE: 100
};

const heightOptions = {
    AUTO: 'auto',
    FIXED: 'fixed'
};

const defaultOptions = {
    height: heightOptions.FIXED,
    maxRows: 100,
    defaultElHeight: 300,
    useSlidingWindow: true
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
            helpers.throwInvalidOperationError("ListView: you must specify a 'collection' option.");
        }
        this.gridEventAggregator = options.gridEventAggregator;

        this.__createReqres();
        options.childViewOptions && (this.childViewOptions = options.childViewOptions);
        this.childViewOptions = Object.assign(options.childViewOptions || {}, {
            internalListViewReqres: this.internalReqres
        });
        options.emptyView && (this.emptyView = options.emptyView);
        options.emptyViewOptions && (this.emptyViewOptions = options.emptyViewOptions);
        options.childView && (this.childView = options.childView);
        options.childViewSelector && (this.childViewSelector = options.childViewSelector);
        options.loadingChildView && (this.loadingChildView = options.loadingChildView);
        this.listenTo(this.gridEventAggregator, 'toggle:collapse:all', this.__toggleCollapseAll);
        // this.listenTo(this, 'childview:click', child => this.trigger('row:click', child.model));
        // this.listenTo(this, 'childview:dblclick', child => this.trigger('row:dblclick', child.model));
        this.listenTo(this, 'childview:toggle:collapse', this.__updateCollapseAll);
        this.maxRows = options.maxRows || defaultOptions.maxRows;
        this.useSlidingWindow = options.useSlidingWindow || defaultOptions.useSlidingWindow;
        this.height = options.height;
        this.forbidSelection = _.isBoolean(options.forbidSelection) ? options.forbidSelection : true;

        if (options.height === undefined) {
            this.height = defaultOptions.height;
        }

        this.childHeight = options.childHeight || 25;
        this.state = {
            position: 0
        };

        const debouncedHandleResize = _.debounce(() => this.handleResize(), 100);
        this.listenTo(GlobalEventService, 'resize', debouncedHandleResize);
        this.parentCollection = this.collection;
        this.listenTo(this.parentCollection, 'add remove reset', debouncedHandleResize);
        this.listenTo(this.parentCollection, 'add remove reset', () => (this.rowsPull = {}));
        this.collection = new SlidingWindowCollection(this.collection);
        this.rowsPull = {};
    },

    regions: {
        visibleCollectionRegion: '.visible-collection-view'
    },

    childViewContainer: '.js-visible-collection-container',

    ui: {
        visibleCollection: '.js-visible-collection-container'
    },

    events: {
        scroll: '__onScroll',
        keydown: '__handleKeydown'
    },

    className: 'list',

    template: Handlebars.compile(template),

    onAttach() {
        // Updating viewportHeight and dom:refreshrendering subviews
        //this.collection.updateWindowSize(1);
        this.handleResize();
    },

    onRender() {
        if (this.forbidSelection) {
            htmlHelpers.forbidSelection(this.el);
        }
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
            helpers.throwInvalidOperationError("ListView: you must specify either 'childView' or 'childViewSelector' option.");
        }
        return childView;
    },

    // keyboardShortcuts: {
    //     up(e) {
    //         this.moveCursorBy(-1, e.shiftKey);
    //     },
    //     down(e) {
    //         this.moveCursorBy(+1, e.shiftKey);
    //     },
    //     pageup(e) {
    //         const delta = Math.ceil(this.state.viewportHeight * 0.8);
    //         this.moveCursorBy(-delta, e.shiftKey);
    //     },
    //     pagedown(e) {
    //         const delta = Math.ceil(this.state.viewportHeight * 0.8);
    //         this.moveCursorBy(delta, e.shiftKey);
    //     },
    //     home(e) {
    //         this.__moveCursorTo(0, e.shiftKey);
    //     },
    //     end(e) {
    //         this.__moveCursorTo(this.parentCollection.length - 1, e.shiftKey);
    //     }
    // },

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
    },

    __handleKeydown(e) {
        let delta;
        if (e.target.tagName === 'INPUT') {
            return;
        }
        const selectedModels = this.parentCollection.selected instanceof Backbone.Model ? [this.parentCollection.selected] : Object.values(this.parentCollection.selected);
        switch (event.keyCode) {
            case keyCode.UP:
                this.moveCursorBy(-1, e.shiftKey);
                return false;
            case keyCode.DOWN:
                this.moveCursorBy(+1, e.shiftKey);
                return false;
            case keyCode.PAGE_UP:
                delta = Math.ceil(this.state.viewportHeight * 0.8);
                this.moveCursorBy(-delta, e.shiftKey);
                return false;
            case keyCode.PAGE_DOWN:
                delta = Math.ceil(this.state.viewportHeight * 0.8);
                this.moveCursorBy(delta, e.shiftKey);
                return false;
            case keyCode.SPACE:
                selectedModels.forEach(model => model.toggleChecked());
                return false;
            case keyCode.LEFT:
                if (this.options.isTree) {
                    selectedModels.forEach(model => model.collapse());
                    return false;
                }
                break;
            case keyCode.RIGHT:
                if (this.options.isTree) {
                    selectedModels.forEach(model => model.expand());
                    return false;
                }
                break;
            case keyCode.ENTER:
            case keyCode.DELETE:
            case keyCode.BACKSPACE:
            case keyCode.ESCAPE:
            case keyCode.TAB: {
                break;
            }
            case keyCode.HOME:
                this.__moveCursorTo(0, e.shiftKey);
                return false;
            case keyCode.END:
                this.__moveCursorTo(this.parentCollection.length - 1, e.shiftKey);
                return false;
            default:
                break;
        }
    },

    __createReqres() {
        this.internalReqres = Backbone.Radio.channel(_.uniqueId('listV'));
        this.internalReqres.reply('childViewEvent', this.__handleChildViewEvent, this);
    },

    __handleChildViewEvent(view, eventName, eventArguments) {
        this.trigger.apply(this, [`childview:${eventName}`, view].concat(eventArguments));
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
                selectFn.call(this.parentCollection, model, false, shiftPressed, this.getOption('selectOnCursor'));
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
        return Math.max(0, Math.min(maxPos, position - config.VISIBLE_COLLECTION_RESERVE / 2));
    },

    // normalized the index so that it fits in range [0, this.collection.length - 1]
    __normalizeCollectionIndex(index) {
        return Math.max(0, Math.min(this.parentCollection.length - 1, index));
    },

    __onScroll() {
        if (this.state.viewportHeight === undefined || this.parentCollection.length <= this.state.viewportHeight || this.internalScroll) {
            return;
        }
        const newPosition = Math.max(0, Math.floor(this.el.scrollTop / this.childHeight));
        this.__updatePositionInternal(newPosition, false);
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

        newPosition = this.collection.updatePosition(Math.max(0, newPosition));
        this.state.position = newPosition;
        if (triggerEvents) {
            this.internalScroll = true;
            const scrollTop
                = Math.max(0, newPosition > (this.parentCollection.length - config.VISIBLE_COLLECTION_RESERVE) / 2 ? newPosition + config.VISIBLE_COLLECTION_RESERVE : newPosition)
                * this.childHeight;
            this.el.scrollTop = scrollTop;
            _.delay(() => (this.internalScroll = false), 100);
        }

        return newPosition;
    },

    // Updates state.viewportHeight and visibleCollection.state.windowSize.
    handleResize() {
        if (this.isDestroyed) {
            return;
        }

        const oldViewportHeight = this.state.viewportHeight;

        const elementHeight = this.el.clientHeight;

        if (this.children && this.children.length && !this.isEmpty()) {
            const firstChild = this.children.first().el;
            if (firstChild && firstChild.offsetHeight) {
                this.childHeight = firstChild.offsetHeight;
            }
        }

        // Checking options consistency
        if (this.height === heightOptions.AUTO && !_.isFinite(this.maxRows)) {
            helpers.throwInvalidOperationError("ListView configuration error: you have passed option height: AUTO into ListView control but didn't specify maxRows option.");
        }

        // Computing new elementHeight and viewportHeight
        this.state.viewportHeight = Math.max(1, Math.floor(elementHeight / this.childHeight));
        const visibleCollectionSize = (this.state.visibleCollectionSize = this.state.viewportHeight);
        const allItemsHeight = this.childHeight * this.parentCollection.length;

        this.ui.visibleCollection.height(allItemsHeight);
        if (this.gridEventAggregator) {
            this.gridEventAggregator.trigger('update:height', allItemsHeight);
        }

        // Applying the result of computation
        if (this.state.viewportHeight === oldViewportHeight) {
            // nothing changed
            return;
        }

        //this.el.style.height = `${adjustedElementHeight}px`;
        this.collection.updateWindowSize(visibleCollectionSize + config.VISIBLE_COLLECTION_RESERVE);
        _.defer(() => this.__updatePadding());
    },

    __updatePadding() {
        if (this.el.scrollHeight > this.el.offsetHeight) {
            const scrollBarWidth = this.el.offsetWidth - this.el.clientWidth;
            this.$el.css({
                width: `calc(100% + ${scrollBarWidth}px)`,
                paddingRight: scrollBarWidth
            });
        }
    },

    getAdjustedElementHeight(elementHeight) {
        let adjustedElementHeight;
        if (this.height !== heightOptions.AUTO) {
            if (elementHeight) {
                adjustedElementHeight = elementHeight;
            } else {
                let parent = this.el.offsetParent;
                let clientHeight = parent.clientHeight;
                while (parent && !clientHeight && parent !== document.body) {
                    parent = parent.offsetParent;
                    clientHeight = parent.clientHeight;
                }
                const parentStyles = getComputedStyle(parent);
                const contentHeight = clientHeight - parseFloat(parentStyles.paddingTop) - parseFloat(parentStyles.paddingBottom);
                adjustedElementHeight = contentHeight || defaultOptions.defaultElHeight;
            }
        } else {
            const computedViewportHeight = Math.min(this.maxRows, this.parentCollection.length);
            let minHeight = 0;
            let outerBoxAdjustments = 0;

            if (this.isEmpty()) {
                minHeight = this.$el.find('.empty-view').height();
            }

            outerBoxAdjustments = this.ui.visibleCollection.outerHeight() % this.childHeight;

            adjustedElementHeight = Math.max(this.childHeight * computedViewportHeight + outerBoxAdjustments, minHeight);
        }
        return adjustedElementHeight;
    },

    onAddChild(child) {
        requestAnimationFrame(() => {
            const childModel = child.model;
            const top = `${this.parentCollection.indexOf(childModel) * this.childHeight}px`;
            child.el.style.top = top;
            childModel.trigger('update:top', top);
        });
    },

    __toggleCollapseAll(collapsed) {
        this.__updateTreeCollapse(this.parentCollection, collapsed);
        //todo: find better way to rebuild models
        if (this.parentCollection.length) {
            const firstModel = this.parentCollection.at(0);
            if (collapsed) {
                this.parentCollection.collapse(firstModel);
            } else {
                this.parentCollection.expand(firstModel);
            }
        }

        this.gridEventAggregator.trigger('collapse:change');
    },

    __updateTreeCollapse(collection, collapsed) {
        collection.forEach(model => {
            model.collapsed = collapsed;
            if (model.children && model.children.length) {
                this.__updateTreeCollapse(model.children, collapsed);
            }
        });
    },

    __getParentCollapsed(model) {
        let collapsed = false;
        let parentModel = model.parentModel;
        while (parentModel) {
            if (parentModel.collapsed !== false) {
                collapsed = true;
                break;
            }
            parentModel = parentModel.parentModel;
        }
        return collapsed;
    },

    __updateCollapseAll() {
        let collapsed = true;
        for (let i = 0; i < this.children.length; i++) {
            const row = this.children.findByIndex(i);
            if (row.model.level === 0 && row.model.collapsed === false) {
                collapsed = false;
                break;
            }
        }
        this.gridEventAggregator.trigger('update:collapse:all', collapsed);
        this.gridEventAggregator.trigger('collapse:change');
    }
});

export default ListView;
