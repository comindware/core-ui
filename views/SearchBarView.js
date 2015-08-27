/**
 * Developer: Ksenia Kartvelishvili
 * Date: 19.03.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['module/lib', 'text!../templates/searchBar.html', 'core/services/LocalizationService'],
    function (utils, template, LocalizationService) {
        'use strict';

        var defaultOptions = {
            placeholder: LocalizationService.get('CORE.VIEWS.SEARCHBAR.PLACEHOLDER'),
            delay: 300
        };

        return Marionette.ItemView.extend({
            initialize: function (options) {
                _.extend(this.options, defaultOptions, options || {});
                this.model = new Backbone.Model({
                    placeholder: this.options.placeholder
                });
                _.debounce(this.__triggerSearch, this.options.delay);
            },

            template: Handlebars.compile(template),

            className: 'search-view',

            ui: {
                input: '.js-search-input',
                clear: '.js-search-clear'
            },

            events: {
                'keyup @ui.input': '__search',
                'click @ui.clear': '__clear'
            },

            onRender: function () {
                this.ui.clear.toggle(!!this.ui.input.val());
            },

            __search: function() {
                var value = this.ui.input.val();
                this.__triggerSearch(value);
                this.ui.clear.toggle(!!value);
            },

            __triggerSearch: function (value) {
                this.trigger('search', value);
            },

            __clear: function() {
                this.ui.input.val('');
                this.search();
                this.ui.input.focus();
            }
        });
    });
