/**
 * Developer: Alexander Makarov
 * Date: 15.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['text!../templates/editorCanvas.html', 'comindware/core', './PresentationItemView'],
    function (template, core, PresentationItemView) {
        'use strict';

        return Marionette.LayoutView.extend({
            initialize: function (options) {
                core.utils.helpers.ensureOption(options, 'editor');
                core.utils.helpers.ensureOption(options, 'presentation');

                this.model = new Backbone.Model({
                    editorMode: 'none'
                });
                this.editor = options.editor;
            },

            template: Handlebars.compile(template),

            ui: {
                editorRegion: '.js-editor-region'
            },

            regions: {
                editorRegion: '.js-editor-region',
                modelRegion: '.js-model-region',
                editorModeRegion: '.js-editor-mode-region'
            },

            modelEvents:{
                'change': 'updateEditorModel'
            },

            onShow: function() {
                this.editorRegion.show(this.editor);
                if (this.options.canvasWidth) {
                       this.ui.editorRegion.css('width', this.options.canvasWidth);
                }

                var presentationView;
                if (_.isString(this.options.presentation)) {
                    presentationView = new PresentationItemView({
                        model: this.editor.model,
                        template: Handlebars.compile('<span style="vertical-align: top;">model[' + this.editor.key + ']: </span><span>' + this.options.presentation + '</span>')
                    });
                } else {
                    presentationView = new this.options.presentation({
                        model: this.editor.model
                    });
                }
                this.modelRegion.show(presentationView);

                var editorModeView = new core.form.editors.RadioGroupEditor({
                    model: this.model,
                    key: 'editorMode',
                    autocommit: true,
                    radioOptions: [
                        {
                            id: 'none',
                            displayText: 'Normal'
                        },
                        {
                            id: 'readonly',
                            displayText: 'Readonly'
                        },
                        {
                            id: 'disabled',
                            displayText: 'Disabled'
                        }
                    ]
                });
                this.editorModeRegion.show(editorModeView);
            },

            updateEditorModel: function() {
                var editorMode = this.model.get('editorMode');
                switch (editorMode) {
                case 'none':
                    this.editor.setEnabled(true);
                    this.editor.setReadonly(false);
                    break;
                case 'disabled':
                    this.editor.setEnabled(false);
                    this.editor.setReadonly(false);
                    break;
                case 'readonly':
                    this.editor.setEnabled(true);
                    this.editor.setReadonly(true);
                    break;
                }
            }
        });
    });
