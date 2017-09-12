/**
 * Developer: Grigory Kuznetsov
 * Date: 14.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

import { Handlebars } from 'lib';
import template from '../templates/nativeGrid.hbs';
import ListView from './ListView';
import RowView from './RowView';
import HeaderView from './HeaderView';
import ColumnHeaderView from './ColumnHeaderView';
import NoColumnsDefaultView from '../../list/views/NoColumnsView';
import dropdownFactory from '../../dropdown/factory';
import dropdownApi from 'dropdown';
import { helpers } from 'utils';

const defaultOptions = {
    headerView: HeaderView,
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
 * @param {Backbone.View} [options.headerView={@link module:core.nativeGrid.views.HeaderView}] View, используемый для отображения заголовка списка
 * @param {Backbone.View} options.emptyView View для отображения пустого списка (нет строк)
 * @param {Backbone.View} [options.noColumnsView] View для отображения списка без колонок
 * @param {Object} [options.noColumnsViewOptions] Опции для noColumnsView
 * @param {Function} [options.onColumnSort] Метод, обрабатывющий событие сортировки колонок
 * @param {Number} [options.paddingLeft=10] Левый отступ
 * @param {Number} [options.paddingRight=20] Правый отступ
 * @param {Backbone.View} [options.rowView={@link module:core.nativeGrid.views.RowView}] View используемый для отображения строки списка
 * @param {Function} [options.rowViewSelector] Функция для разрешения (resolve) View, используемого для отображения строки списка.
 * Получает в качестве аргумента модель строки списка, должна вернуть необходимый класс View (например, {@link module:core.nativeGrid.views.RowView})
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

    initialize(options) {
        helpers.ensureOption(options, 'collection');
        _.defaults(this.options, defaultOptions);

        this.rowView = this.options.rowView;
        this.rowViewSelector = this.options.rowViewSelector;
        this.collection = this.options.collection;
        this.emptyView = this.options.emptyView;
        this.emptyViewOptions = this.options.emptyViewOptions;
        options.onColumnSort && (this.onColumnSort = this.options.onColumnSort); //jshint ignore:line

        this.initializeViews();
        this.$document = $(document);
    },

    initializeViews() {
        this.headerView = new this.options.headerView({
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

        const childViewOptions = _.extend(this.options.gridViewOptions || {}, {
            columns: this.options.columns,
            gridEventAggregator: this,
            paddingLeft: this.options.paddingLeft,
            paddingRight: this.options.paddingRight
        });

        this.listView = new ListView({
            childView: this.rowView,
            collection: this.collection,
            childViewOptions,
            childViewSelector: this.rowViewSelector,
            emptyView: this.emptyView,
            emptyViewOptions: this.emptyViewOptions
        });

        this.listenTo(this, 'afterColumnsResize', this.__afterColumnsResize, this);
        this.listenTo(this.headerView, 'onColumnSort', this.onColumnSort, this);
        this.listenTo(this, 'showFilterView', this.showFilterPopout, this);
        this.listenTo(this.listView, 'all', (eventName, view, eventArguments) => {
            if (_.string.startsWith(eventName, 'childview')) {
                this.trigger.apply(this, [eventName, view ].concat(eventArguments));
            }
        });
    },

    __onRowClick(model) {
        this.trigger('row:click', model);
    },

    __onRowDblClick(model) {
        this.trigger('row:dblclick', model);
    },

    __afterColumnsResize(width) {
        this.listView.setWidth(width);
    },

    onRender() {
        this.ui.headerRegion.css({
            left: `${this.options.paddingLeft}px`,
            right: `${this.options.paddingRight}px`
        });
    },

    onShow() {
        if (this.options.columns.length === 0) {
            const noColumnsView = new this.noColumnsView(this.noColumnsViewOptions);
            this.noColumnsViewRegion.show(noColumnsView);
        }
        this.headerRegion.show(this.headerView);
        this.listRegion.show(this.listView);
        this.bindListRegionScroll();
    },

    bindListRegionScroll() {
        this.listRegion.$el.scroll(event => {
            this.headerRegion.$el.scrollLeft(event.currentTarget.scrollLeft);
        });
    },

    onColumnSort(column, comparator) {
        this.collection.comparator = comparator;
        this.collection.sort();
    },

    setFitToView() {
        this.headerView.setFitToView();
        if (this.collection.length > 0) {
            this.listView.setFitToView();
        }
    },

    showFilterPopout(options) {
        const AnchoredButtonView = Marionette.ItemView.extend({
            template: Handlebars.compile('<span class="js-anchor"></span>'),
            behaviors: {
                CustomAnchorBehavior: {
                    behaviorClass: dropdownApi.views.behaviors.CustomAnchorBehavior,
                    anchor: '.js-anchor'
                }
            },
            tagName: 'div'
        });

        const filterViewOptions = _.find(this.options.columns, c => c.id === options.columnHeader.options.column.id).filterViewOptions;

        this.filterDropdown = dropdownFactory.createPopout({
            buttonView: AnchoredButtonView,
            panelView: options.filterView,
            panelViewOptions: filterViewOptions,
            customAnchor: true
        });

        this.listenTo(this.filterDropdown, 'all', (eventName, eventArguments) => {
            if (_.string.startsWith(eventName, 'panel:')) {
                this.trigger.apply(this, [`column:filter:${eventName.slice(6)}`,
                    options.columnHeader.options.column.id, this.filterDropdown.panelView ].concat(eventArguments));
            }
        });

        this.listenTo(this.filterDropdown, 'close', (child, closeOptions) => {
            this.trigger('column:filter:close', options.columnHeader.options.column.id, child.panelView, closeOptions);
        });

        this.popoutRegion.show(this.filterDropdown);
        this.filterDropdown.$el.offset(options.position);
        this.filterDropdown.open();
    }
});
