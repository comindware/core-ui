/**
 * Developer: Stepan Burguchev
 * Date: 6/30/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        'module/lib',
        'core/utils/utilsApi',
        'core/services/UrlService',
        './views/DefaultContentView'
    ],
    function (lib, utilsApi, UrlService, DefaultContentView) {
        'use strict';

        return Marionette.Controller.extend({
            constructor: function (options) {
                utilsApi.helpers.ensureOption(options, 'config');
                this.view = new this.contentView();
                this.moduleRegion  = this.view.moduleRegion;
                Marionette.Controller.prototype.constructor.apply(this, arguments);
            },

            contentView: DefaultContentView
        });
    });
