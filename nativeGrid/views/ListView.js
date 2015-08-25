/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Marionette, _, Handlebars, classes, shared, $ */

define([
        'module/lib',
        'core/utils/utilsApi',
        '../collections/ListCollection',
        'text!core/list/templates/list.html'
    ],
    function (lib, utils, ListCollection, template) {
        'use strict';

        var VisibleCollectionView = Marionette.CollectionView.extend({
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
                    utils.helpers.throwInvalidOperationError('ListView: you must specify either \'childView\' or \'childViewSelector\' option.');
                }
                return childView;
            },

            updateHeight: function (h) {
                this.$el.height(h);
            }
        });

        var heightOptions = {
            AUTO: 'auto',
            FIXED: 'fixed'
        };

        var defaultOptions = {
            height: heightOptions.FIXED
        };

        var ListView = Marionette.LayoutView.extend({
            initialize: function (options) {
                if (this.collection === undefined) {
                    utils.helpers.throwInvalidOperationError('ListView: you must specify a \'collection\' option.');
                }

                if (options.childHeight === undefined) {
                    utils.helpers.throwInvalidOperationError('ListView: you must specify a \'childHeight\' option - outer height for childView view (in pixels).');
                }
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

                this.maxRows = options.maxRows;
                this.height = options.height;

                if (options.height === undefined) {
                    this.height = defaultOptions.height;
                }

                this.childHeight = options.childHeight;
                this.state = {
                    position: 0
                };

                this.listenTo(this.options.gridEventAggregator, 'listResized', this.__onListResized, this);
                this.visibleCollection = new ListCollection(this.collection);
                _.bindAll(this, '__handleResize', '__handleResizeInternal');
                $(window).resize(this.__handleResize);
            },

            regions: {
                visibleCollectionRegion: '.visible-collection-view'
            },

            className: 'list',
            template: Handlebars.compile(template),

            onShow: function () {
                // Updating viewportHeight and rendering subviews
                this.visibleCollectionView = new VisibleCollectionView({
                    childView: this.childView,
                    childViewSelector: this.childViewSelector,
                    className: 'visible-collection',
                    collection: this.visibleCollection,
                    emptyView: this.emptyView,
                    emptyViewOptions: this.emptyViewOptions,
                    childViewOptions: this.childViewOptions,
                    loadingChildView: this.loadingChildView,
                    gridEventAggregator: this.options.gridEventAggregator
                });

                this.listenTo(this.visibleCollectionView, 'childview:click', function (child) {
                    this.trigger('row:click', child.model);
                });

                this.listenTo(this.visibleCollectionView, 'childview:dblclick', function (child) {
                    this.trigger('row:dblclick', child.model);
                });

                this.visibleCollectionRegion.show(this.visibleCollectionView);
                this.__updateHeight();
            },

            __updateHeight: function () {
                var h = this.getElementHeight();
                this.$el.height(h);
                this.visibleCollectionView && this.visibleCollectionView.updateHeight(h);
            },
            
            onRender: function () {
                utils.htmlHelpers.forbidSelection(this.el);
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
                this.keyListener = new lib.keypress.Listener(this.el);
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
                    utils.helpers.throwInvalidOperationError('ListView: updatePosition() has been called before the full initialization of the view.');
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

            getElementHeight: function () {
                var collectionL = this.collection.length,
                    numberOfElements,
                    minHeight = 0;

                if (this.maxRows) {
                    numberOfElements = Math.min(this.maxRows, collectionL);
                } else if (this.height === 'auto' && this.state.viewportHeight > collectionL) {
                    numberOfElements = collectionL;
                }

                if (this.visibleCollectionView && this.visibleCollectionView.isEmpty()) {
                    minHeight = this.visibleCollectionView.$el.find('.empty-view').height();
                }

                return Math.max(this.childHeight * numberOfElements, minHeight);
            },

            __onListResized: function (fullWidth) {
                this.$el.width(fullWidth);
            },

            __handleResize: function () {
                this.__handleResizeInternal();
            },

            __handleResizeInternal: function () {
                setTimeout(function () {
                    var fullWidth = this.$el.parent().width(),
                        currentWidth = this.$el.width();

                    if (fullWidth > currentWidth) {
                        this.$el.width(fullWidth);
                    }
                }.bind(this), 200);
            }
        });

        return ListView;
    });
