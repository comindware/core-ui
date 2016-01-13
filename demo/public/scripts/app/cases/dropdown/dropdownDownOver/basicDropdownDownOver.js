(function () {
    'use strict';

    var core = require('comindware/core');

    return core.dropdown.factory.createDropdown({
        buttonView: Marionette.ItemView.extend({
            template: Handlebars.compile('<input value="" class="input" placeholder="Enter text!">'),
            tagName: 'span'
        }),
        panelView: Marionette.ItemView.extend({
            template: Handlebars.compile('<div style="width:300px; height: 350px;">test</div>')
        }),
        panelPosition: 'down-over'
    });
})();
