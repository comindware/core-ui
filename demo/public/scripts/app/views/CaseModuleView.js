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

define(['text!../templates/caseModule.html', 'comindware/core', 'prism', 'require', 'markdown'],
    function (template, core, prism, require) {
        'use strict';

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                this.loadCaseData();
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

            loadCaseData: function() {
                var path;
                if (this.model.id) {
                    path = this.model.get('sectionId') +'/' + this.model.get('groupId') + '/' + this.model.id;
                } else {
                    path = this.model.get('sectionId') +'/' + this.model.get('groupId');
                }
                var caseScriptPath = 'text!../cases/' + path + '.js';
                var caseScript = '../cases/' + path;

                require([ caseScriptPath, caseScript ], function(caseSourceText, caseFactory) {
                    this.model.set('sourceCode', caseSourceText);
                    var representationView = caseFactory();
                    this.caseRepresentationRegion.show(representationView);
                }.bind(this));
            }
        });
    });
