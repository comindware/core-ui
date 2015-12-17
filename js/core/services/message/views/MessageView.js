/**
 * Developer: Stepan Burguchev
 * Date: 4/23/2015
 * Copyright: 2009-2016 Comindware�
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/message.html', 'core/libApi', '../../WindowService'],
    function (template, lib, WindowService, LocalizationService) {
        'use strict';

        return Marionette.ItemView.extend({
            initialize: function () {
            },

            className: 'msg-popup',

            ui: {
                buttons: '.js-buttons'
            },

            events: {
                'click @ui.buttons': '__onSelect'
            },

            template: Handlebars.compile(template),

            close: function (result) {
                WindowService.closePopup();
                this.trigger('close', result);
            },

            __onSelect: function (e) {
                var index = this.ui.buttons.index(e.target);
                var buttonModel = this.model.get('buttons')[index];
                var result = buttonModel.id;
                this.close(result);
            }
        });
    });
