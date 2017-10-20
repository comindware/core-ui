/**
 * Developer: Stanislav Guryev
 * Date: 02.02.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from '../templates/toolbar.html';

export default Marionette.LayoutView.extend({
    className: 'dev-code-editor-toolbar',

    template: Handlebars.compile(template),

    ui: {
        undo: '.js-code-editor-undo',
        redo: '.js-code-editor-redo',
        format: '.js-code-editor-format',
        hint: '.js-code-editor-hint',
        find: '.js-code-editor-find',
        maximize: '.js-code-editor-maximize',
        minimize: '.js-code-editor-minimize'
    },

    triggers: {
        'click @ui.undo': 'undo',
        'click @ui.redo': 'redo',
        'click @ui.format': 'format',
        'click @ui.hint': 'show:hint',
        'click @ui.find': 'find'
    },

    events: {
        'click @ui.maximize': '__onMaximize',
        'click @ui.minimize': '__onMinimize',
    },

    onShow() {
        this.ui.minimize.hide();
    },

    maximize() {
        this.ui.maximize.hide();
        this.ui.minimize.show();
    },

    __onMaximize() {
        this.ui.maximize.hide();
        this.ui.minimize.show();
        this.trigger('maximize');
    },

    __onMinimize() {
        this.ui.maximize.show();
        this.ui.minimize.hide();
        this.trigger('minimize');
    }
});

