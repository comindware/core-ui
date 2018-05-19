//@flow
import { keyCode, helpers, htmlHelpers } from 'utils';
import GlobalEventService from '../../services/GlobalEventService';
import template from '../templates/collection.hbs';

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
 * @extends Marionette.View
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

export default Marionette.CompositeView.extend({
    initialize(options) {
        if (this.collection === undefined) {
            helpers.throwInvalidOperationError("ListView: you must specify a 'collection' option.");
        }
        this.gridEventAggregator = options.gridEventAggregator;

        options.childViewOptions && (this.childViewOptions = options.childViewOptions);
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

        if (this.collection.getState().position !== 0 && this.collection.isSliding) {
            this.collection.updatePosition(0);
        }

        this.debouncedHandleResize = _.debounce(() => this.handleResize(), 100);
        this.listenTo(GlobalEventService, 'window:resize', this.debouncedHandleResize);
        this.listenTo(this.collection.parentCollection, 'add remove reset ', this.debouncedHandleResize);
        // this.on('render', this.__onRender);
    },

    attributes() {
        return {
            tabindex: 1
        };
    },

    template: Handlebars.compile(template),

    childViewContainer: '.js-visible-collection-wrp',

    ui: {
        childViewContainer: '.js-visible-collection-wrp'
    },

    events: {
        keydown: '__handleKeydown'
    },

    className: 'visible-collection',

    onAttach() {
        this.handleResize();
        if (this.forbidSelection) {
            htmlHelpers.forbidSelection(this.el);
        }
        this.listenTo(this.collection, 'update:child', model => this.__updateChildTop(this.children.findByModel(model)));
        this.$el.parent().on('scroll', this.__onScroll.bind(this));
    },

    _showCollection() {
        const models = this.collection.visibleModels;

        models.forEach((child, index) => {
            this._addChild(child, index);
        });
        this.children._updateLength();
    },

    // override default method to correct add twhen index === 0 in visible collection
    _onCollectionAdd(child, collection, opts) {
        // `index` is present when adding with `at` since BB 1.2; indexOf fallback for < 1.2
        let index = opts.at !== undefined && (opts.index !== undefined ? opts.index : collection.indexOf(child));

        if (this.filter || index === false) {
            index = _.indexOf(this._filteredSortedModels(index), child);
        }

        if (this._shouldAddChild(child, index)) {
            this._destroyEmptyView();
            this._addChild(child, index);
        }
    },

    childView(child) {
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
        this.__moveCursorTo(this.collection.length - 1, e.shiftKey);
    },

    __handleKeydown(e) {
        let delta;
        const handle = (!this.getOption('isEditable') || e.ctrlKey) && this.collection.isSliding;
        const eventResult = !handle && e.target.tagName === 'INPUT';
        const selectedModels = this.collection.selected instanceof Backbone.Model ? [this.collection.selected] : Object.values(this.collection.selected || {});
        e.stopPropagation();
        switch (e.keyCode) {
            case keyCode.UP:
                if (handle) {
                    this.moveCursorBy(-1, e.shiftKey);
                }
                return eventResult;
            case keyCode.DOWN:
                if (handle) {
                    this.moveCursorBy(1, e.shiftKey);
                }
                return eventResult;
            case keyCode.PAGE_UP:
                delta = Math.ceil(this.state.viewportHeight * 0.8);
                this.moveCursorBy(-delta, e.shiftKey);
                return false;
            case keyCode.PAGE_DOWN:
                delta = Math.ceil(this.state.viewportHeight * 0.8);
                this.moveCursorBy(delta, e.shiftKey);
                return false;
            case keyCode.SPACE:
                if (handle) {
                    selectedModels.forEach(model => model.toggleChecked());
                }
                return eventResult;
            case keyCode.LEFT:
                if (handle) {
                    this.collection.trigger('move:left');
                }
                return eventResult;
            case keyCode.RIGHT:
                if (handle) {
                    this.collection.trigger('move:right');
                }
                return eventResult;
            case keyCode.TAB:
                return false;
            case keyCode.ENTER:
            case keyCode.DELETE:
            case keyCode.BACKSPACE:
            case keyCode.ESCAPE:
                break;
            case keyCode.HOME:
                if (handle) {
                    this.__moveCursorTo(0, e.shiftKey);
                }
                return eventResult;
            case keyCode.END:
                if (handle) {
                    this.__moveCursorTo(this.collection.length - 1, e.shiftKey);
                }
                return eventResult;
            default:
                break;
        }
    },

    __moveCursorTo(newCursorIndex, shiftPressed) {
        const cid = this.collection.cursorCid;
        let index = 0;
        this.collection.find((x, i) => {
            if (x.cid === cid) {
                index = i;
                return true;
            }
            return false;
        });

        const nextIndex = this.__normalizeCollectionIndex(newCursorIndex);
        if (nextIndex !== index) {
            const model = this.collection.at(nextIndex);
            const selectFn = this.collection.selectSmart || this.collection.select;
            if (selectFn) {
                selectFn.call(this.collection, model, false, shiftPressed);
            }
            this.scrollTo(nextIndex);
        }
    },

    // Move the cursor to a new position [cursorIndex + positionDelta] (like when user changes selected item using keyboard)
    moveCursorBy(cursorIndexDelta, shiftPressed) {
        const cid = this.collection.cursorCid;
        let index = 0;
        this.collection.find((x, i) => {
            if (x.cid === cid) {
                index = i;
                return true;
            }
            return false;
        });

        const nextIndex = this.__normalizeCollectionIndex(index + cursorIndexDelta);
        if (nextIndex !== index) {
            const model = this.collection.at(nextIndex);
            const selectFn = this.collection.selectSmart || this.collection.select;
            if (selectFn) {
                selectFn.call(this.collection, model, false, shiftPressed, this.getOption('selectOnCursor'));
            }

            this.scrollTo(nextIndex);
        }
    },

    scrollTo(index) {
        const indexDelta = index - this.state.position;
        const criticalOffset = 7;
        if (indexDelta < criticalOffset || indexDelta > this.state.viewportHeight - criticalOffset) {
            const centerItemDelta = Math.floor(this.state.viewportHeight / 2 - 1);
            const newPosition = this.state.position + indexDelta - centerItemDelta;
            this.__updatePositionInternal(newPosition, true);
        }
    },

    __normalizePosition(position) {
        const maxPos = Math.max(0, this.collection.length - this.state.visibleCollectionSize);
        return Math.max(0, Math.min(maxPos, position - config.VISIBLE_COLLECTION_RESERVE / 2));
    },

    // normalized the index so that it fits in range [0, this.collection.length - 1]
    __normalizeCollectionIndex(index) {
        return Math.max(0, Math.min(this.collection.length - 1, index));
    },

    __onScroll() {
        if (this.state.viewportHeight === undefined || this.collection.length <= this.state.viewportHeight || this.internalScroll || this.isDestroyed()) {
            return;
        }

        const newPosition = Math.max(0, Math.floor(this.$el.parent().scrollTop() / this.childHeight));
        this.__updatePositionInternal(newPosition, false);
        this.__updateTop();
    },

    __updateTop() {
        const top = Math.max(0, this.collection.indexOf(this.collection.visibleModels[0]) * this.childHeight);
        this.ui.childViewContainer[0].style.top = `${top}px`;

        if (this.gridEventAggregator) {
            this.gridEventAggregator.trigger('update:top', top);
        }
    },

    updatePosition(newPosition) {
        this.__updatePositionInternal(newPosition, false);
    },

    __updatePositionInternal(position, triggerEvents) {
        let newPosition = position;
        newPosition = this.__normalizePosition(newPosition);
        if (newPosition === this.state.position || !this.collection.isSliding) {
            return;
        }

        newPosition = this.collection.updatePosition(Math.max(0, newPosition));
        this.state.position = newPosition;
        if (triggerEvents) {
            this.internalScroll = true;
            const scrollTop =
                Math.max(0, newPosition > (this.collection.length - config.VISIBLE_COLLECTION_RESERVE) / 2 ? newPosition + config.VISIBLE_COLLECTION_RESERVE : newPosition) *
                this.childHeight;
            if (this.el.parentNode) {
                this.$el.parent().scrollTop(scrollTop);
            }
            this.__updateTop();
            _.delay(() => (this.internalScroll = false), 100);
        }

        return newPosition;
    },

    handleResize() {
        if (!this.collection.isSliding) {
            return;
        }
        const oldViewportHeight = this.state.viewportHeight;
        const oldAllItemsHeight = this.state.allItemsHeight;

        const availableHeight = (this.el.parentElement && this.el.parentElement.clientHeight) || window.innerHeight;

        if (this.children && this.children.length && !this.isEmpty()) {
            const firstChild = this.children.first().el;
            if (firstChild && firstChild.offsetHeight) {
                this.childHeight = firstChild.offsetHeight;
            }
        }

        if (this.height === heightOptions.AUTO && !_.isFinite(this.maxRows)) {
            helpers.throwInvalidOperationError("ListView configuration error: you have passed option height: AUTO into ListView control but didn't specify maxRows option.");
        }

        // Computing new elementHeight and viewportHeight
        this.state.viewportHeight = Math.max(1, Math.floor(Math.min(availableHeight, window.innerHeight) / this.childHeight));
        const visibleCollectionSize = (this.state.visibleCollectionSize = this.state.viewportHeight);
        const allItemsHeight = (this.state.allItemsHeight = this.childHeight * this.collection.length);

        if (allItemsHeight !== oldAllItemsHeight) {
            this.$el.height(allItemsHeight);
            if (this.gridEventAggregator) {
                this.gridEventAggregator.trigger('update:height', allItemsHeight);
            }
        }

        if (this.state.viewportHeight === oldViewportHeight) {
            return;
        }

        this.collection.updateWindowSize(visibleCollectionSize + config.VISIBLE_COLLECTION_RESERVE);
        //_.defer(() => this.__updatePadding());
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
            const computedViewportHeight = Math.min(this.maxRows, this.collection.length);
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

    onAddChild(view, child) {
        this.__updateChildTop(child);
    },

    __updateChildTop(child) {
        if (!child) {
            return;
        }
        requestAnimationFrame(() => {
            const childModel = child.model;
            if (this.getOption('showRowIndex')) {
                const index = childModel.collection.indexOf(childModel) + 1;
                if (index !== childModel.currentIndex) {
                    childModel.trigger('update:model', index);
                }
            }
            if (this.getOption('isTree') && typeof child.insertFirstCellHtml === 'function') {
                child.insertFirstCellHtml();
            }
        });
    },

    __toggleCollapseAll(collapsed) {
        this.__updateTreeCollapse(this.collection, collapsed);
        if (this.gridEventAggregator) {
            this.gridEventAggregator.trigger('collapse:change');
        }
        this.collection.rebuild();
        this.debouncedHandleResize();
    },

    __updateTreeCollapse(collection, collapsed) {
        collection.forEach(model => {
            model.collapsed = collapsed;
            model.trigger('toggle:collapse', model);
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
        const collapsed = !this.collection.parentCollection.some(model => model.collapsed === false);
        if (this.gridEventAggregator) {
            this.gridEventAggregator.trigger('update:collapse:all', collapsed);
            this.gridEventAggregator.trigger('collapse:change');
        }
        this.debouncedHandleResize();
    }
});
