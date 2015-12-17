/**
 * Developer: Stepan Burguchev
 * Date: 12/2/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

/*
 * This class is fully compatible with Backbone.Form.editors.Base and should be used to create Marionette-based editors for Backbone.Form
 * */

define(['core/libApi', './MarionetteEditorPrototype'],
    function (lib, MarionetteEditorPrototype) {
        'use strict';
        return Marionette.CollectionView.extend(MarionetteEditorPrototype.create(Marionette.CollectionView));
    });
