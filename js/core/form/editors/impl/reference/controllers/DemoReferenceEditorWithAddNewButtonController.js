/**
 * Developer: Denis Krasnovsky
 * Date: 19.01.2016
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define(['core/libApi',
        'core/list/listApi',
        'core/utils/utilsApi',
        '../models/SearchMoreModel',
        '../models/DefaultReferenceModel'],
    function (lib, list, utils, SearchMoreModel, DefaultReferenceModel) {
        'use strict';

        var DemoReferenceCollections = Backbone.Collection.extend({
            model: DefaultReferenceModel
        });

        return Marionette.Controller.extend({
            initialize:function(){
                this.collection = list.factory.createWrappedCollection(new DemoReferenceCollections([]),
                    { delayedAdd:false });
            },

            fetch:function(options){
                this.totalCount = 123123;
                this.options = options;

                   if (this.options.text) {
                    var filterText = this.options.text.trim().toUpperCase();
                    if (filterText) {
                        this.collection.filter(function (model) {
                            if (model instanceof SearchMoreModel) {
                                return true;
                            }
                            var text = model.get('text');
                            if (!text) {
                                return false;
                            }
                            return text.toUpperCase().indexOf(filterText) !== -1;
                        });
                    } else {
                        this.collection.filter(null);
                    }
                } else {
                    this.collection.filter(null);
                }

                return new Promise.resolve();
            },

            objectGenerator: function(names){
                for(var i = 0; i<= names.length; i++ ){
                    if(!_.contains(names,'reference.'+i)){
                        return {
                            id:'reference.'+ i,
                            text: 'test'+i
                        };
                    }
                }
            },

            addNewItem: function () {
                var model;

                if(this.collection.length>1){
                    var names = [];
                    this.collection.models.filter(function(model){
                        if(model.id){
                         names.push(model.id);
                        return true;
                    } else {
                            return false;
                        }
                    });

                    var newItem = this.objectGenerator(names);
                     model = new DefaultReferenceModel(newItem);
                }  else {
                    model = new DefaultReferenceModel({
                        id: 'reference.0',
                        text: 'test'
                    });
                }

               this.collection.add(model);
               this.collection.select(model);
            },

            navigate: function (model) {
                utils.helpers.throwError('Not Implemented.', 'NotImplementedError');
            }
        });
    });
