/**
 * Developer: Stepan Burguchev
 * Date: 9/15/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/splitPanel.hbs';
import GlobalEventService from '../services/GlobalEventService';

const config = {
    smallSize: 550,
    largeSize: 700,
    throttleDelay: 200
};

const classes = {
    smallPanelSize: 'size-small',
    largePanelSize: 'size-large',
    middlePanelSize: 'size-middle'
};

const defaultOptions = {
    panel1Min: 20,
    panel2Min: 20
};

export default Marionette.LayoutView.extend({
    constructor() {
        Marionette.LayoutView.prototype.constructor.apply(this, arguments);

        _.defaults(this.options, defaultOptions);

        _.bindAll(this,
            '__startDragging', '__stopDragging', '__handleDocumentMouseMove',
            '__handleDocumentMouseUp', '__handleResizerMousedown', '__handleWindowResize');

        this.listenTo(GlobalEventService, 'window:resize', _.throttle(this.__handleWindowResize, config.throttleDelay));
        this.on('render', () => {
            this.$el.addClass('double-panels');
        });
        this.on('show', () => {
            this.__handleWindowResize();
        });
    },

    template: Handlebars.compile(template),

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

    __handleResizerMousedown(event) {
        this.__stopDragging();
        this.__startDragging(event);
        return false;
    },

    __handleDocumentMouseMove(event) {
        if (!this.dragContext) {
            return;
        }

        const ctx = this.dragContext;
        if (event.pageX === ctx.pageX) {
            return;
        }

        const newPanel1Width = Math.min(
            Math.max(ctx.panel1InitialWidth + event.pageX - ctx.pageX, this.options.panel1Min), ctx.containerWidth - this.options.panel2Min);
        const leftWidthPx = newPanel1Width / ctx.containerWidth * 100;
        const rightWidthPx = 100 - leftWidthPx;
        this.ui.panel1.css('width', `${leftWidthPx}%`);
        this.ui.resizer.css('left', `${leftWidthPx}%`);
        this.ui.panel2.css('width', `${rightWidthPx}%`);
        this.__handleWindowResize();
        return false;
    },

    __handleDocumentMouseUp() {
        this.__stopDragging();
        return false;
    },

    __startDragging(event) {
        this.dragContext = {
            pageX: event.pageX,
            containerWidth: this.$el.width(),
            panel1InitialWidth: this.ui.panel1.width()
        };
        $(document).mousemove(this.__handleDocumentMouseMove).mouseup(this.__handleDocumentMouseUp);
    },

    __stopDragging() {
        if (!this.dragContext) {
            return;
        }

        const $document = $(document);
        $document.unbind('mousemove', this.__handleDocumentMouseMove);
        $document.unbind('mouseup', this.__handleDocumentMouseUp);
        this.dragContext = null;
        $(window).trigger('resize');
    },

    __updatePanelClasses($panelEl) {
        const panelWidth = $panelEl.width();
        if (!panelWidth) {
            return;
        }

        let newClass;
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

    __handleWindowResize() {
        this.__updatePanelClasses(this.ui.panel1);
        this.__updatePanelClasses(this.ui.panel2);
    }
});
