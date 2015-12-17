/**
 * Developer: Grigory Kuznetsov
 * Date: 16.07.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['core/libApi',
        'core/utils/utilsApi',
        'text!../templates/date.html',
        '../../../../../dropdown/dropdownApi',
        './DatePanelView',
        './DateInputView'
    ],
    function (lib, utils, template, dropdownApi, PanelView, InputView) {
        'use strict';

        return Marionette.LayoutView.extend({
            template: Handlebars.compile(template),

            className: 'date-view',

            regions: {
                popoutRegion: '.js-popout-region'
            },

            onShow: function () {
                this.pickerPopout = dropdownApi.factory.createPopout({
                    buttonView: InputView,
                    buttonViewOptions: {
                        model: this.model
                    },
                    panelView: PanelView,
                    panelViewOptions: {
                        model: this.model
                    },
                    customAnchor: true,
                    autoOpen: false
                });
                this.listenTo(this.pickerPopout, 'button:open', this.__open, this);
                this.listenTo(this.pickerPopout, 'panel:close', this.__close, this);

                this.popoutRegion.show(this.pickerPopout);
            },

            __close: function () {
                this.pickerPopout.close();
            },

            __open: function () {
                this.pickerPopout.open();
            }
        });
    });
