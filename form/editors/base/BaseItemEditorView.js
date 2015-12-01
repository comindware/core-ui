/**
 * Developer: Stepan Burguchev
 * Date: 10/3/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

/*
* This class is fully compatible with Backbone.Form.editors.Base and should be used to create Marionette-based editors for Backbone.Form
* */

define(['module/lib', './MarionetteEditorPrototype'],
    function (lib, MarionetteEditorPrototype) {
        'use strict';
        /**
         * Some description for initializer
         * @name BaseItemEditorView
         * @memberof module:core.form.editors.base
         * @class BaseItemEditorView
         * @description Базовый класс для editor'ов
         * @extends Marionette.ItemView
         * */
        return Marionette.ItemView.extend(MarionetteEditorPrototype.create(Marionette.ItemView));
    });
