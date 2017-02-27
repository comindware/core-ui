/**
 * Developer: Ksenia Kartvelishvili
 * Date: 24.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { Handlebars } from 'lib';
import dropdown from 'dropdown';
import template from '../templates/defaultButton.hbs';

const classes = {
};

export default Marionette.ItemView.extend({
    initialize: function (options) {
        this.enabled = options.enabled;
        this.reqres = options.reqres;
        this.options.template = Handlebars.compile(options.template || template);
    },

    behaviors: {
        CustomAnchorBehavior: {
            behaviorClass: dropdown.views.behaviors.CustomAnchorBehavior,
            anchor: '.js-anchor'
        }
    },

    className: 'popout-field-user',

    ui: {
        text: '.js-text',
        clearButton: '.js-clear-button'
    },

    events: {
        'click @ui.clearButton': '__clear',
        'click @ui.text': '__navigate',
        'click': '__click'
    },

    __click: function () {
        this.reqres.request('panel:open');
    },

    __clear: function () {
        this.reqres.request('value:clear');
        return false;
    },

    __navigate: function () {
        var member = this.model.get('member');
        if (member) {
            this.reqres.request('value:navigate', member.id);
            return false;
        }
    },

    updateEnabled: function () {
        if (this.model.get('enabled')) {
            this.ui.clearButton.show();
        } else {
            this.ui.clearButton.hide();
        }
    },

    modelEvents: {
        'change:member': 'changeMember',
        'change:enabled': 'updateEnabled'
    },

    changeMember: function() {
        this.render();
        this.onRender();
    },

    onRender: function () {
        this.updateEnabled();
    }
});
