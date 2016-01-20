/**
 * Developer: Denis Krasnovsky
 * Date: 18.01.2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['core/libApi','core/list/listApi','text!../templates/addNewButton.html'],
    function (lib,list,template) {
        'use strict';
        return Marionette.ItemView.extend({
            initialize:function(options){
                this.reqres = options.reqres;
            },
            template: Handlebars.compile(template),
            events:{
                'click':'__onClick'
            },

            className:'add-new-reference-button',

            __onClick:function(){
                this.reqres.request('add:new:item');
            }
        });
    });
