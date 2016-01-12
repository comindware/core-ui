/**
 * Developer: Alexander Makarov
 * Date: 08.07.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['text!../templates/casesList.html', './CaseView'],
    function (template, CaseView) {
        'use strict';
        return Marionette.CompositeView.extend({

            template: Handlebars.compile(template),

            ui: {},

            childView: CaseView,

            childViewContainer: '.js-cases-container'
        });
    });

