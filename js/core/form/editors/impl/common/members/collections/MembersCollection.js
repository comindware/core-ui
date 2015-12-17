/**
 * Developer: Ksenia Kartvelishvili
 * Date: 05.12.2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
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

            comparator: utils.helpers.comparatorFor(utils.comparators.stringComparator2Asc, 'name'),

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
