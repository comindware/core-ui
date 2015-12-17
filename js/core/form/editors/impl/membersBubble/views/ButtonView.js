/**
 * Developer: Ksenia Kartvelishvili
 * Date: 16.04.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['core/libApi', 'text!../templates/button.html', './BubbleView', './InputView', '../models/FakeInputModel'],
    function (utils, template, BubbleView, InputView, FakeInputModel) {
        'use strict';

        var classes = {
            CLASS_NAME: 'bubbles',
            DISABLED: ' disabled'
        };

        return Marionette.CollectionView.extend({
            initialize: function (options) {
                this.reqres = options.reqres;
                this.collection = this.model.get('selected');
            },

            template: Handlebars.compile(template),

            className: function () {
                return classes.CLASS_NAME + (this.options.enabled ? '' : classes.DISABLED);
            },

            getChildView: function (model) {
                if (model instanceof FakeInputModel) {
                    return InputView;
                } else {
                    return this.options.bubbleView || BubbleView;
                }
            },

            focus: function () {
                var fakeInputModel = this.__findFakeInputModel();
                if (!fakeInputModel) {
                    return;
                }
                var input = this.children.findByModel(fakeInputModel);
                if (input && input.focus) {
                    input.focus();
                }
            },

            updateInput: function () {
                var fakeInputModel = this.__findFakeInputModel();
                var input = this.children.findByModel(fakeInputModel);
                if (input) {
                    input.updateInput();
                }
            },

            __findFakeInputModel: function () {
                return _.find(this.collection.models, function (model) {
                    return (model instanceof FakeInputModel) && model;
                });
            },

            events: {
                'click': '__click'
            },

            tagName: 'ul',

            attributes: {
                tabindex: 0
            },

            childViewOptions: function () {
                return {
                    reqres: this.reqres,
                    parent: this.$el,
                    enabled: this.options.enabled
                };
            },

            __click: function () {
                this.reqres.request('button:click');
            },

            updateEnabled: function (enabled) {
                this.children.each(function (cv) {
                    cv.updateEnabled && cv.updateEnabled(enabled);
                });
            }
        });
    });
