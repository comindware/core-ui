/**
 * Developer: Grigory Kuznetsov
 * Date: 22.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['module/lib', './behaviors/GridItemViewBehavior', '../../list/models/behaviors/GridItemBehavior'],
    function (lib, GridItemViewBehavior, GridItemBehavior) {
        'use strict';

        var RowView = Marionette.ItemView.extend({
            constants: {
                paddingLeft: 20,
                paddingRight: 10
            },

            className: 'record-row grid-row',

            events: {
                'click': '__onClick',
                'dblclick': '__onDblClick'
            },

            initialize: function (options) {
                _.extend(this.model, new GridItemBehavior(this));
            },

            behaviors: {
                GridItemViewBehavior: {
                    behaviorClass: GridItemViewBehavior,
                    padding: 30
                }
            },

            getValue: function (id) {
                this.model.get(id);
            },

            _renderTemplate: function () {
                this.cellViews = [];
                this.$el.append('<div class="padding js-padding" style="width: ' + this.constants.paddingLeft + 'px"></div>');
                _.each(this.options.columns, function (gridColumn) {
                    var id = gridColumn.id,
                        value;

                    if (gridColumn.cellViewOptions && gridColumn.cellViewOptions.getValue) {
                        value = gridColumn.cellViewOptions.getValue.apply(this, [gridColumn]);
                    } else {
                        value = this.model.get(id);
                    }

                    var cellView = new gridColumn.cellView({
                        className: 'grid-cell js-grid-c ell',
                        model: new Backbone.Model({
                            value: value,
                            rowModel: this.model,
                            columnConfig: gridColumn,
                            highlightedFragment: null
                        }),
                        gridEventAggregator: this.options.gridEventAggregator
                    });
                    cellView.render();
                    cellView.$el.addClass('js-grid-cell').appendTo(this.$el);
                    this.cellViews.push(cellView);
                }, this);
                this.$el.append('<div class="padding js-padding" style="width: ' + this.constants.paddingRight + 'px"></div>');
            },

            onHighlighted: function (fragment)
            {
                _.each(this.cellViews, function (cellView) {
                    cellView.model.set('highlightedFragment', fragment);
                });
            },

            onUnhighlighted: function ()
            {
                _.each(this.cellViews, function (cellView) {
                    cellView.model.set('highlightedFragment', null);
                });
            },

           __onClick: function () {
               this.trigger('click', this.model);
           },

           __onDblClick: function () {
               this.trigger('dblclick', this.model);
           }
        });

        return RowView;
    });
