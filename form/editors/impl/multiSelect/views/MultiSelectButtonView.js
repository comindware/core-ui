/**
 * Developer: Oleg Verevkin
 * Date: 10/21/2015
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(
    ['module/lib', 'text!../templates/multiSelectButton.html'],
    function (lib, template) {
        'use strict';

        return Marionette.ItemView.extend({
            className: 'field field_dropdown',

            template: Handlebars.compile(template),

            templateHelpers: function () {
                var value = this.model.get('value'),
                    collection = this.model.get('collection');
                
                return {
                    displayValue: value && value.length ?
                        value.length == collection.length ?
                            Localizer.get('CORE.FORM.EDITORS.MULTISELECT.EVERYTHINGSELECTED') :
                            Localizer.get('CORE.FORM.EDITORS.MULTISELECT.ANYTHINGSELECTED') :
                        Localizer.get('CORE.FORM.EDITORS.MULTISELECT.NOTHINGSELECTED')
                };
            },

            events: {
                'click': '__click'
            },

            modelEvents: {
                'change:value': 'render'
            },

            initialize: function(options) {
                this.reqres = options.reqres;
            },

            __click: function () {
                this.reqres.request('panel:open');
            }
        });
    }
);
