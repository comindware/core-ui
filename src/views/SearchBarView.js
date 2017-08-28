/**
 * Developer: Ksenia Kartvelishvili
 * Date: 19.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import { Handlebars } from 'lib';
import template from '../templates/searchBar.hbs';
import LocalizationService from '../services/LocalizationService';

const defaultOptions = () => ({
    placeholder: LocalizationService.get('CORE.VIEWS.SEARCHBAR.PLACEHOLDER'),
    delay: 300
});

export default Marionette.ItemView.extend({
    initialize(options) {
        _.extend(this.options, defaultOptions(), options || {});
        this.model = new Backbone.Model({
            placeholder: this.options.placeholder
        });
        this.__triggerSearch = _.debounce(this.__triggerSearch, this.options.delay);
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

    onRender() {
        this.ui.clear.toggle(!!this.ui.input.val());
    },

    __search() {
        const value = this.ui.input.val();
        this.__triggerSearch(value);
        this.ui.clear.toggle(!!value);
    },

    __triggerSearch(value) {
        this.trigger('search', value);
    },

    __clear() {
        this.ui.input.val('');
        this.__search();
        this.ui.input.focus();
    }
});
