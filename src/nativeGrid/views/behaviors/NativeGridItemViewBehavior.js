/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../../libApi';
import GridItemViewBehavior from '../../../list/views/behaviors/GridItemViewBehavior';

let NativeGridItemViewBehavior = GridItemViewBehavior.extend({
    initialize: function (options, view)
    {
        GridItemViewBehavior.prototype.initialize.apply(this, arguments);

        this.paddingLeft = view.options.paddingLeft;
        this.paddingRight = view.options.paddingRight;
        this.padding = options.padding;
        this.listenTo(view.options.gridEventAggregator, 'columnStartDrag', this.__onColumnStartDrag);
        this.listenTo(view.options.gridEventAggregator, 'columnStoptDrag', this.__onColumnStopDrag);
        this.listenTo(view.options.gridEventAggregator, 'singleColumnResize', this.__onSingleColumnResize);
        this.view.setFitToView = this.setFitToView.bind(this);
    },

    __onColumnStartDrag: function (sender, index) {
        this.gridCellDragger = $(this.cells[index]);
    },

    __onColumnStopDrag: function () {
        delete this.draggedColumn;
    },

    onShow(){},

    setFitToView: function () {
        this.__setInitialWidth();
    },

    __setInitialWidth() {
        for (let i = 0; i < this.cells.length; i++) {
            $(this.cells[i]).outerWidth(this.columns[i].width);
        }
    },

    __getElementOuterWidth: function (el) {
        return $(el)[0].getBoundingClientRect().width;
    },

    __onSingleColumnResize(newWidth) {
        this.gridCellDragger.outerWidth(newWidth);
    }
});

export default NativeGridItemViewBehavior;
