/**
 * Developer: Stepan Burguchev
 * Date: 3/20/2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['./BaseReferenceEditorController',
        'core/libApi'
],
    function (BaseReferenceEditorController, lib) {
        'use strict';

        return BaseReferenceEditorController.extend({
            navigate: function (model) {
                return false;
            }
        });
    });
