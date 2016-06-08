/**
 * Developer: Alexander Makarov
 * Date: 13.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer, Prism */

"use strict";

var requireCode = require.context("babel!../cases", true);
var requireText = require.context("raw!../cases", true);

define(['text!../templates/content.html', 'comindware/core', 'prism', 'markdown'],
    function (template, core, Prism, markdown) {
        return Marionette.LayoutView.extend({
            initialize: function (options) {
            },

            modelEvents: {
                'change': 'render'
            },

            template: Handlebars.compile(template),

            templateHelpers: function () {
                return {
                    description: markdown.toHTML(this.model.get('description') || '')
                };
            },

            regions: {
                caseRepresentationRegion: '.js-case-representation-region'
            },

            ui: {
                code: '.js-code'
            },

            onRender: function () {
                Prism.highlightElement(this.ui.code[0]);
            },

            onShow: function() {
                let path;
                if (this.model.id) {
                    path = this.model.get('sectionId') +'/' + this.model.get('groupId') + '/' + this.model.id;
                } else {
                    path = this.model.get('sectionId') +'/' + this.model.get('groupId');
                }

                let code = requireCode('./' + path);
                let text = requireText('./' + path);

                this.model.set('sourceCode', text);
                var representationView = code();
                this.caseRepresentationRegion.show(representationView);
            }
        });
    });
