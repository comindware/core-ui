/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import template from '../../list/templates/list.hbs';
import { keypress, Handlebars } from 'lib';
import { helpers } from 'utils';

/**
 * Some description for initializer
 * @name ListView
 * @memberof module:core.nativeGrid.views
 * @class ListView
 * @description View контента списка
 * @extends Marionette.LayoutView
 * @param {Object} options Constructor options
 * @param {Backbone.View} options.childView view Строки списка
 * @param {Function} [options.childViewSelector] ?
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк)
 * @param {Object} [options.emptyViewOptions] Опции для emptyView
 * @param {Backbone.View} options.loadingChildView View-лоадер, показывается при подгрузке строк
 * */
export default Marionette.CollectionView.extend({
    initialize(options) {
        helpers.ensureOption(options, 'collection');

        this.__createReqres();

        this.childViewOptions = _.extend(options.childViewOptions || {}, {
            internalListViewReqres: this.internalReqres
        });

        options.childViewOptions && (this.childViewOptions = options.childViewOptions); // jshint ignore:line
        options.emptyView && (this.emptyView = options.emptyView); // jshint ignore:line
        options.emptyViewOptions && (this.emptyViewOptions = options.emptyViewOptions); // jshint ignore:line
        options.childView && (this.childView = options.childView); // jshint ignore:line
        options.childViewSelector && (this.childViewSelector = options.childViewSelector); // jshint ignore:line
        options.loadingChildView && (this.loadingChildView = options.loadingChildView);// jshint ignore:line

        this.state = {
            position: 0
        };

        _.bindAll(this, '__handleResize', '__handleResizeInternal');
        $(window).resize(this.__handleResize);
    },
    /**
     * Class for view
     * @param {String} CSS class
     * */
    className: 'visible-collection',
    /**
     * View template
     * @param {HTML} HTML file
     * */
    template: Handlebars.compile(template),

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

    setFitToView() {
        this.children.each(ch => {
            ch.setFitToView();
        });
    },

    onRender() {
        this.__assignKeyboardShortcuts();

        this.listenTo(this, 'childview:click', child => this.trigger('row:click', child.model));
        this.listenTo(this, 'childview:dblclick', child => this.trigger('row:dblclick', child.model));
    },

    keyboardShortcuts: {
        up(e) {
            this.__moveToNeighbor('top', e.shiftKey);
        },
        down(e) {
            this.__moveToNeighbor('bottom', e.shiftKey);
        },
        pageup(e) {
            this.__moveToNextPage('top', e.shiftKey);
        },
        pagedown(e) {
            this.__moveToNextPage('bottom', e.shiftKey);
        },
        home(e) {
            this.__selectByIndex(0, e.shiftKey);
            this.__scrollToTop();
        },
        end(e) {
            this.__selectByIndex(this.collection.length - 1, e.shiftKey);
            this.__scrollToBottom();
        }
    },

    setWidth(fullWidth) {
        this.$el.width(fullWidth);
    },

    getSelectedViewIndex() {
        const cid = this.collection.cursorCid;
        let index = 0;
        this.collection.find((x, i) => {
            if (x.cid === cid) {
                index = i;
                return true;
            }
            return false;
        });

        return index;
    },

    __createReqres() {
        this.internalReqres = new Backbone.Wreqr.RequestResponse();
        this.internalReqres.setHandler('childViewEvent', this.__handleChildViewEvent, this);
    },

    __handleChildViewEvent(view, eventName, eventArguments) {
        this.trigger.apply(this, [ `childview:${eventName}`, view ].concat(eventArguments));
    },

    __scrollToTop() {
        const $parentEl = this.$el.parent();
        $parentEl.scrollTop(0);
    },

    __scrollToBottom() {
        const $parentEl = this.$el.parent();
        $parentEl.scrollTop(this.$el.height());
    },

    __scrollToNeighbor(index) {
        const view = this.children.findByIndex(index);
        const $parentEl = this.$el.parent();
        const currentScrollTop = $parentEl.scrollTop();
        const visibleHeight = this.$el.parent().height();
        const viewPositionTop = view.$el.position().top;
        const viewHeight = view.$el.height();
        const viewBottomPos = viewPositionTop + viewHeight;

        if (viewBottomPos > visibleHeight) {
            $parentEl.scrollTop(currentScrollTop + viewHeight);
        } else if (viewPositionTop < 0) {
            $parentEl.scrollTop(currentScrollTop - viewHeight);
        }
    },

    __scrollToIndex(index, offset) {
        const view = this.children.findByIndex(index);
        const $parentEl = this.$el.parent();
        const currentScrollTop = $parentEl.scrollTop();
        const viewPositionTop = view.$el.position().top;
        const newScrollPos = offset ? currentScrollTop + viewPositionTop + offset : currentScrollTop + viewPositionTop;

        $parentEl.scrollTop(newScrollPos);
    },

    __selectByIndex(nextIndex, shiftPressed) {
        const model = this.collection.at(nextIndex);
        const selectFn = this.collection.selectSmart || this.collection.select;
        if (selectFn) {
            selectFn.call(this.collection, model, false, shiftPressed);
        }
    },

    __moveToNeighbor(direction, shiftPressed) {
        const selectedIndex = this.getSelectedViewIndex();
        let nextIndex = selectedIndex;

        direction === 'top' ? nextIndex-- : nextIndex++; //jshint ignore: line

        if (nextIndex !== selectedIndex) {
            nextIndex = this.__normalizeCollectionIndex(nextIndex);
            this.__selectByIndex(nextIndex, shiftPressed);
            this.__scrollToNeighbor(nextIndex);
        }
    },

    __moveToNextPage(direction, shiftPressed) {
        const selectedIndex = this.getSelectedViewIndex();
        const selectedView = this.children.findByIndex(selectedIndex);
        const selectedPositionTop = selectedView.$el.position().top;
        let nextIndex = selectedIndex;

        if (direction === 'top') {
            nextIndex = this.__getTopIndex(selectedIndex);
        } else {
            nextIndex = this.__getBottomIndex(selectedIndex);
        }

        if (nextIndex !== selectedIndex) {
            nextIndex = this.__normalizeCollectionIndex(nextIndex);
            this.__selectByIndex(nextIndex, shiftPressed);
            this.__scrollToIndex(nextIndex, -selectedPositionTop);
        }
    },

    __getTopIndex(index) {
        let cHeight = 0;
        let newIndex = index;
        const childViews = this.children.toArray();

        for (let i = index - 1; i >= 0; i--) {
            const newH = cHeight + childViews[i].$el.height();

            if (newH > this.$el.parent().height()) {
                break;
            } else {
                newIndex = i;
                cHeight = newH;
            }
        }

        return newIndex;
    },

    __getBottomIndex(index) {
        let cHeight = 0;
        let newIndex = index;
        const childViews = this.children.toArray();

        for (let i = index + 1; i < childViews.length; i++) {
            const newH = cHeight + childViews[i].$el.height();

            if (newH > this.$el.parent().height()) {
                break;
            } else {
                newIndex = i;
                cHeight = newH;
            }
        }

        return newIndex;
    },

    // normalized the index so that it fits in range [0, this.collection.length - 1]
    __normalizeCollectionIndex(index) {
        return Math.max(0, Math.min(this.collection.length - 1, index));
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

    __handleResize() {
        this.__handleResizeInternal();
    },

    __handleResizeInternal() {
        this.state.visibleHeight = this.$el.parent().height();

        setTimeout(() => {
            const fullWidth = this.$el.parent().width();
            const currentWidth = this.$el.width();

            if (fullWidth > currentWidth) {
                this.$el.width(fullWidth);
            }
        }, 200);
    }
});
