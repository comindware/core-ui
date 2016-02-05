/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import { moment } from '../../../../../libApi';
import { dateHelpers } from '../../../../../utils/utilsApi';
import dropdown from '../../../../../dropdown/dropdownApi';
import list from '../../../../../list/listApi';
import TimeInputView from './TimeInputView';
import template from '../templates/time.hbs';

export default Marionette.LayoutView.extend({
    initialize: function () {
        this.reqres = new Backbone.Wreqr.RequestResponse();
        this.reqres.setHandler('time:selected', this.__onTimeSelected, this);
        this.reqres.setHandler('panel:open', this.__onPanelOpen, this);
        this.reqres.setHandler('panel:close', this.__onPanelClose, this);
    },

    className: 'time-view',

    template: template,

    regions: {
        dropdownRegion: '.js-dropdown-region'
    },

    onRender: function () {
        var timeArray = [];

        for (var h = 0; h < 24; h++) {
            for (var m = 0; m < 60; m+=15) {
                var val = {hours: h, minutes: m},
                    time = moment(val),
                    formattedTime = dateHelpers.getDisplayTime(time);

                timeArray.push({
                    time: time,
                    formattedTime: formattedTime
                });
            }
        }

        this.dropdownView = dropdown.factory.createDropdown({
            buttonView: TimeInputView,
            buttonViewOptions: {reqres: this.reqres, model: this.model},
            panelView: Marionette.CollectionView.extend({
                reqres: this.reqres,
                collection: new Backbone.Collection(timeArray),
                tagName: 'ul',
                className: 'time-dropdown',
                childView: Marionette.ItemView.extend({
                    tagName: 'li',
                    className: 'time-dropdown__i',
                    reqres: this.reqres,
                    events: {
                        'click': '__handleClick'
                    },
                    __handleClick: function () {
                        //noinspection JSPotentiallyInvalidUsageOfThis
                        this.reqres.request('time:selected', new Date(this.model.get('time')));
                    },
                    template: Handlebars.compile('{{this.formattedTime}}')
                })
            }),
            autoOpen: false,
            panelPosition: 'down'
        });

        this.dropdownRegion.show(this.dropdownView);
    },

    __onTimeSelected: function (time) {
        var oldVal = this.model.get('value'),
            newVal = '';

        if (time === null || time === '') {
            newVal = null;
        } else if (oldVal) {
            var momentTime = moment(time);
            newVal = new Date(moment(oldVal).hour(momentTime.hour()).minute(momentTime.minute()));
        } else {
            newVal = time;
        }

        this.model.set('value', newVal);
        this.dropdownView.close();
    },

    __onPanelOpen: function () {
        if (this.model.get('enabled') && !this.model.get('readonly')) {
            this.dropdownView.open();
        }
    },

    __onPanelClose: function () {
        this.dropdownView.close();
    }
});
