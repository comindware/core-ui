/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['./views/PopoutView', './views/ListPanelView', './views/MenuItemView', './views/DefaultButtonView', './views/MenuPanelView', './views/DropdownView'],
    function (PopoutView, ListPanelView, MenuItemView, DefaultButtonView, MenuPanelView, DropdownView) {
        'use strict';

        var factory = {
            /*
            * Create a common menu view.
            *
            * Example:
            *
            * options: {
            *   text: 'Actions',
            *   items: [
            *       {
            *           id: 'create',
            *           name: 'Create'
            *       },
            *       {
            *           id: 'delete',
            *           name: 'Delete'
            *       }
            *   ]
            * }
            * */
            createMenu: function (options) {
                options = options || {};
                options.buttonView = options.buttonView || DefaultButtonView;
                return factory.createButtonMenu(options);
            },

            createButtonMenu: function(options) {
                var collection = options.items;
                if (!(collection instanceof Backbone.Collection)) {
                    collection = new Backbone.Collection(collection);
                }

                var effectiveButtonModel = options.buttonModel || new Backbone.Model({
                    text: options.text
                });

                if (!options.buttonModel) {
                    var defaultActModel = collection.findWhere({ default: true });
                    if (defaultActModel) {
                        effectiveButtonModel = defaultActModel;
                        collection.remove(effectiveButtonModel);
                    }
                }

                var popoutOptions = {
                    buttonView: options.buttonView,
                    buttonViewOptions: {
                        model: effectiveButtonModel
                    },
                    panelView: MenuPanelView,
                    panelViewOptions: {
                        collection: collection
                    },
                    customAnchor: options.customAnchor
                };
                if (options.popoutAlign) {
                    popoutOptions.popoutAlign = options.popoutAlign;
                }
                return factory.createPopout(popoutOptions);
            },

            createDialogPopout: function (options) {
                var defaults = {
                    fade: true,
                    height: 'bottom'
                };
                options = _.extend(defaults, options);
                return factory.createPopout(options);
            },

            /*
            * Create a popout with custom button and panel views
            *
            * Example:
            *
            * options: {
            *   buttonView: MyButtonView,
            *   buttomViewOptions: {
            *     model: new Backbone.Model({
            *       text: 'Click Me!'
            *     })
            *   },
            *   panelView: MyPanelView,
            *   panelViewOptions: {
            *     collection: new Backbone.Collection([
            *       {
            *           id: 1,
            *           name: Steve
            *       }
            *     ])
            *   }
            * }
            *
            * */
            createPopout: function (options) {
                return new PopoutView(options);
            },

            createDropdownList: function (options) {
                return new DropdownView({
                    buttonView: options.buttonView,
                    panelView: ListPanelView.extend({
                        childView: options.listItemView,
                        className: 'dropdown-list'
                    }),
                    panelViewOptions: {
                        collection: options.collection
                    }
                });
            },

            /*
             * Create a dropdown with custom button and panel views
             *
             * Example:
             *
             * options: {
             *   buttonView: MyButtonView,
             *   buttomViewOptions: {
             *     model: new Backbone.Model({
             *       text: 'Default Input Content!'
             *     })
             *   },
             *   panelView: MyPanelView,
             *   panelViewOptions: {
             *     collection: new Backbone.Collection([
             *       {
             *           id: 1,
             *           name: Steve
             *       }
             *     ])
             *   }
             * }
             *
             * */
            createDropdown: function (options) {
                return new DropdownView(options);
            }
        };

        return factory;
    });
