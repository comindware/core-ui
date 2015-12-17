/**
 * Developer: Grigory Kuznetsov
 * Date: 27.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['core/libApi', 'text!../templates/loadingRow.html'],
    function (lib, template) {
        'use strict';

        /**
         * Some description for initializer
         * @name LoadingRowView
         * @memberof module:core.list.views
         * @class LoadingRowView
         * @extends Marionette.ItemView
         * @constructor
         * @description View показывает loader при подгрузке контента
         * */
        return Marionette.ItemView.extend({
            className: 'dev-loading-row',
            template: Handlebars.compile(template)
        });
    });
