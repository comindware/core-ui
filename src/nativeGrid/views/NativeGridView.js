/**
 * Developer: Grigory Kuznetsov
 * Date: 14.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from '../../libApi';
import template from '../templates/nativeGrid.hbs';
import ListView from './ListView';
import RowView from './RowView';
import HeaderView from './HeaderView';
import ColumnHeaderView from './ColumnHeaderView';
import NoColumnsDefaultView from '../../list/views/NoColumnsView';
import SelectableBehavior from '../../models/behaviors/SelectableBehavior';
import dropdownFactory from '../../dropdown/factory';
import dropdownApi from '../../dropdown/dropdownApi';
import { helpers } from '../../utils/utilsApi';

let defaultOptions = {
    rowView: RowView,
    paddingLeft: 20,
    paddingRight: 10
};

/**
 * Some description for initializer
 * @name NativeGridView
 * @memberof module:core.nativeGrid.views
 * @class NativeGridView
 * @description View используемый по умолчанию для отображения строки списка
 * @extends Marionette.LayoutView
 * @param {Object} options Constructor options
 * @param {Backbone.Collection} options.collection Коллекция строк списка
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк)
 * @param {Backbone.View} [options.noColumnsView] View для отображения списка без колонок
 * @param {Object} [options.noColumnsViewOptions] Опции для noColumnsView
 * @param {Function} [options.onColumnSort] Метод, обрабатывющий событие сортировки колонок
 * @param {Number} [options.paddingLeft=10] Левый отступ
 * @param {Number} [options.paddingRight=20] Правый отступ
 * @param {Backbone.View} [options.rowView={@link module:core.nativeGrid.views.RowView}] View используемый для отображения строки списка
 * */
export default Marionette.LayoutView.extend({
    template: Handlebars.compile(template),

    regions: {
        headerRegion: '.js-native-grid-header-region',
        listRegion: '.js-native-grid-list-region',
        noColumnsViewRegion: '.js-nocolumns-view-region',
        popoutRegion: '.js-popout-region'
    },

    ui: {
        headerRegion: '.js-native-grid-header-region'
    },

    className: 'native-grid',

    initialize: function (options) {
        helpers.ensureOption(options, 'collection');
        _.defaults(this.options, defaultOptions);

        this.rowView = this.options.rowView;
        this.collection = this.options.collection;
        this.emptyView = this.options.emptyView;
        options.onColumnSort && (this.onColumnSort = this.options.onColumnSort); //jshint ignore:line

        this.initializeViews();
        this.$document = $(document);
    },

    initializeViews: function () {
        this.headerView = new HeaderView({
            columns: this.options.columns,
            gridColumnHeaderView: ColumnHeaderView,
            gridEventAggregator: this
        });

        if (this.options.noColumnsView) {
            this.noColumnsView = this.options.noColumnsView;
        } else {
            this.noColumnsView = NoColumnsDefaultView;
        }
        this.options.noColumnsViewOptions && (this.noColumnsViewOptions = this.options.noColumnsViewOptions); // jshint ignore:line

        var childViewOptions = _.extend(this.options.gridViewOptions || {}, {
            columns: this.options.columns,
            gridEventAggregator: this,
            paddingLeft: this.options.paddingLeft,
            paddingRight: this.options.paddingRight
        });

        this.listView = new ListView({
            childView: this.rowView,
            collection: this.collection,
            childViewOptions: childViewOptions,
            emptyView: this.emptyView
        });

        this.listenTo(this, 'afterColumnsResize', this.__afterColumnsResize, this);
        this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
        this.listenTo(this, 'showFilterView', this.showFilterPopout, this);
        this.listenTo(this.listView, 'all', function (eventName, view, eventArguments) {
            if (_.string.startsWith(eventName, 'childview')) {
                this.trigger.apply(this, [eventName, view ].concat(eventArguments));
            }
        }.bind(this));
    },

    __onRowClick: function (model) {
        this.trigger('row:click', model);
    },

    __onRowDblClick: function (model) {
        this.trigger('row:dblclick', model);
    },

    __afterColumnsResize: function (width) {
        this.listView.setWidth(width);
    },

    onRender: function () {
        this.ui.headerRegion.css({
            left: this.options.paddingLeft + 'px',
            right: this.options.paddingRight + 'px'
        });
    },

    onShow: function () {
        if (this.options.columns.length === 0) {
            var noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
            this.noColumnsViewRegion.show(noColumnsView);
        }
        this.headerRegion.show(this.headerView);
        this.listRegion.show(this.listView);
        this.bindListRegionScroll();
    },

    bindListRegionScroll: function () {
        this.listRegion.$el.scroll(function (event) {
            this.headerRegion.$el.scrollLeft(event.currentTarget.scrollLeft);
        }.bind(this));
    },

    onColumnSort: function (column, comparator) {
        this.collection.comparator = comparator;
        this.collection.sort();
    },

    setFitToView: function () {
        this.headerView.setFitToView();
        if (this.collection.length > 0) {
            this.listView.setFitToView();
        }
    },

    showFilterPopout: function (options) {
        var AnchoredButtonView = Marionette.ItemView.extend({
            template: Handlebars.compile('<span class="js-anchor"></span>'),
            behaviors: {
                CustomAnchorBehavior: {
                    behaviorClass: dropdownApi.views.behaviors.CustomAnchorBehavior,
                    anchor: '.js-anchor'
                }
            },
            tagName: 'div'
        });

        var filterViewOptions = _.find(this.options.columns, function (c) {
            return c.id === options.columnHeader.options.column.id;
        }).filterViewOptions;

        this.filterDropdown = dropdownFactory.createPopout({
            buttonView: AnchoredButtonView,
            panelView: options.filterView,
            panelViewOptions: filterViewOptions,
            customAnchor: true
        });

        this.listenTo(this.filterDropdown, 'all', function (eventName, eventArguments) {
            if (_.string.startsWith(eventName, 'panel:')) {
                this.trigger.apply(this, ['column:filter:' + eventName.slice(6),
                    options.columnHeader.options.column.id, this.filterDropdown.panelView ].concat(eventArguments));
            }
        }.bind(this));

        this.listenTo(this.filterDropdown, 'close', function (child, closeOptions) {
            this.trigger('column:filter:close', options.columnHeader.options.column.id, child.panelView, closeOptions);
        }.bind(this));

        this.popoutRegion.show(this.filterDropdown);
        this.filterDropdown.$el.offset(options.position);
        this.filterDropdown.open();
    }
});
