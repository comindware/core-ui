/**
 * Developer: Stepan Burguchev
 * Date: 9/15/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../libApi';
import template from '../templates/splitPanel.hbs';
import GlobalEventService from '../services/GlobalEventService';

var config = {
    smallSize: 550,
    largeSize: 700,
    throttleDelay: 200
};

var classes = {
    smallPanelSize: "size-small",
    largePanelSize: "size-large",
    middlePanelSize: "size-middle"
};

var defaultOptions = {
    panel1Min: 20,
    panel2Min: 20
};

export default Marionette.LayoutView.extend({
    constructor: function () {
        Marionette.LayoutView.prototype.constructor.apply(this, arguments);

        _.defaults(this.options, defaultOptions);

        _.bindAll(this,
            '__startDragging', '__stopDragging', '__handleDocumentMouseMove',
            '__handleDocumentMouseUp', '__handleResizerMousedown', '__handleWindowResize');

        this.listenTo(GlobalEventService, 'resize', _.throttle(this.__handleWindowResize, config.throttleDelay));
        this.on('render', function () {
            this.$el.addClass('dev-core__double-column-wrp');
        }.bind(this));
        this.on('show', function () {
            this.__handleWindowResize();
        }.bind(this));
    },

    template: template,

    regions: {
        panel1Region: '.js-panel1',
        panel2Region: '.js-panel2'
    },

    ui: {
        resizer: '.js-resizer',
        panel1: '.js-panel1',
        panel2: '.js-panel2'
    },

    events: {
        'mousedown @ui.resizer': '__handleResizerMousedown'
    },

    __handleResizerMousedown: function (event) {
        this.__stopDragging();
        this.__startDragging(event);
        return false;
    },

    __handleDocumentMouseMove: function (event) {
        if (!this.dragContext) {
            return;
        }

        var ctx = this.dragContext;
        if (event.pageX === ctx.pageX) {
            return;
        }

        var newPanel1Width = Math.min(
            Math.max(ctx.panel1InitialWidth + event.pageX - ctx.pageX, this.options.panel1Min), ctx.containerWidth - this.options.panel2Min);
        var leftWidthPx = newPanel1Width / ctx.containerWidth * 100;
        var rightWidthPx = 100 - leftWidthPx;
        this.ui.panel1.css('width', leftWidthPx + '%');
        this.ui.resizer.css('left', leftWidthPx + '%');
        this.ui.panel2.css('width', rightWidthPx + '%');
        this.__handleWindowResize();
        return false;
    },

    __handleDocumentMouseUp: function () {
        this.__stopDragging();
        return false;
    },

    __startDragging: function (event) {
        this.dragContext = {
            pageX: event.pageX,
            containerWidth: this.$el.width(),
            panel1InitialWidth: this.ui.panel1.width()
        };
        $(document).mousemove(this.__handleDocumentMouseMove).mouseup(this.__handleDocumentMouseUp);
    },

    __stopDragging: function () {
        if (!this.dragContext) {
            return;
        }

        var $document = $(document);
        $document.unbind('mousemove', this.__handleDocumentMouseMove);
        $document.unbind('mouseup', this.__handleDocumentMouseUp);
        this.dragContext = null;
        $(window).trigger('resize');
    },

    __updatePanelClasses: function($panelEl) {
        var panelWidth = $panelEl.width();
        if (!panelWidth) {
            return;
        }

        var newClass;
        if (panelWidth < config.smallSize) {
            newClass = classes.smallPanelSize;
        } else if (panelWidth < config.largeSize) {
            newClass = classes.middlePanelSize;
        } else {
            newClass = classes.largePanelSize;
        }

        if (!$panelEl.hasClass(newClass)) {
            $panelEl.removeClass(classes.smallPanelSize);
            $panelEl.removeClass(classes.middlePanelSize);
            $panelEl.removeClass(classes.largePanelSize);
            $panelEl.addClass(newClass);
        }
    },

    __handleWindowResize: function() {
        this.__updatePanelClasses(this.ui.panel1);
        this.__updatePanelClasses(this.ui.panel2);
    }
});
