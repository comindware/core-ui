/**
 * Developer: Grigory Kuznetsov
 * Date: 27.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['core/libApi', 'text!core/list/templates/noColumns.html'],
    function (lib, template) {
        'use strict';

        /**
         * Some description for initializer
         * @name NoColumnsView
         * @memberof module:core.list.views
         * @class NoColumnsView
         * @extends Marionette.ItemView
         * @constructor
         * @description View используемый по умолчанию для отображения списка без колонок
         * */
        return Marionette.ItemView.extend({
            className: 'dev-no-columns-view',
            template: Handlebars.compile(template)
        });
    });
