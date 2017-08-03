/**
 * Developer: Grigory Kuznetsov
 * Date: 17.08.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';
import GridItemViewBehavior from '../../../list/views/behaviors/GridItemViewBehavior';

const NativeGridItemViewBehavior = GridItemViewBehavior.extend({
    initialize(options, view) {
        GridItemViewBehavior.prototype.initialize.apply(this, arguments);

        this.paddingLeft = view.options.paddingLeft;
        this.paddingRight = view.options.paddingRight;
        this.padding = options.padding;
        this.listenTo(view.options.gridEventAggregator, 'columnStartDrag', this.__onColumnStartDrag);
        this.listenTo(view.options.gridEventAggregator, 'columnStoptDrag', this.__onColumnStopDrag);
        this.listenTo(view.options.gridEventAggregator, 'singleColumnResize', this.__onSingleColumnResize);
        this.view.setFitToView = this.setFitToView.bind(this);
    },

    __onColumnStartDrag(sender, index) {
        const cells = this.__getCellElements();
        this.gridCellDragger = $(cells[index]);
        this.columnsWidth = [];
        cells.each((i, el) => {
            this.columnsWidth.push(this.__getElementOuterWidth(el));
        });
        this.initialFullWidth = this.$el.parent().width();
    },

    __onColumnStopDrag() {
        delete this.draggedColumn;
    },

    onShow() {
        this.__setInitialWidth(true);
    },

    setFitToView() {
        this.__setInitialWidth();
    },

    __setInitialWidth() {
        const $cells = this.__getCellElements();

        for (let i = 0; i < $cells.length; i++) {
            const $cell = $($cells[i]);
            const cellWidth = this.columns[i].width;

            $cell.outerWidth(cellWidth);
        }
    },

    __getElementOuterWidth(el) {
        return $(el)[0].getBoundingClientRect().width;
    },

    __onSingleColumnResize(sender, args) {
        this.gridCellDragger.outerWidth(this.columnsWidth[args.index] + args.delta);
    }
});

export default NativeGridItemViewBehavior;
