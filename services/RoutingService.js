/**
 * Developer: Stepan Burguchev
 * Date: 6/26/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
        'module/lib'
    ],
    function () {
        'use strict';

        return {
            initialize: function () {

                // Then we start loading default module (after that we can start history)
                // this.__navigateToDefaultModule();
                Backbone.history.start();
                /*new AppRouter({
                 controller:new Controller()
                 });*/
                /*var Controller = Backbone.Marionette.Controller.extend({
                    initialize: function (options) {
                        //App.headerRegion.show(new HeaderView());
                    },
                    //gets mapped to in AppRouter's appRoutes
                    index:function () {
                        //App.mainRegion.show(new WelcomeView());
                    }
                });

                //--
                var AppRouter = Marionette.AppRouter.extend({
                    //"index" must be a method in AppRouter's controller
                    appRoutes: {
                        "": "index"
                    }
                });

                //--*/
            }
        };
    });
