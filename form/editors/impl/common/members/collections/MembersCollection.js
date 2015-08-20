/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.12.2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, Marionette, $, _ */

define([
        'core/utils/utilsApi',
        'core/collections/VirtualCollection',
        'core/collections/behaviors/HighlightableBehavior',
        '../models/MemberModel'
    ],
    function (utils, VirtualCollection, HighlightableBehavior, MemberModel) {
        'use strict';

        return VirtualCollection.extend({
            initialize: function () {
                utils.helpers.applyBehavior(this, HighlightableBehavior);
            },

            model: MemberModel,

            applyTextFilter: function (text) {
                this.deselect();
                this.unhighlight();

                if(!text) {
                    this.filter(null);
                    this.selectFirst();
                    return;
                }
                text = text.toLowerCase();
                this.filter(function (model) {
                    return model.matchText(text);
                });
                this.highlight(text);
                this.selectFirst();
            },

            selectFirst: function () {
                if (this.length > 0) {
                    this.at(0).select();
                }
            }
        });
    });
