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
            /**
             * @memberof module:core.dropdown.factory
             * @method createMenu
             * @description Метод для создания меню
             * @param {Object} options Constructor options
             * @param {Backbone.View} [options.buttonView] View меню
             * @param {String} [options.direction=down] Вертикальное расположение popout'а относительно якоря (up/bottom)
             * @param {Boolean} [options.fade=false] Fade-эффект
             * @param {String} [options.height=auto] (auto/bottom)
             * @param {Array} options.items Элементы меню
             * @param {String} [options.text] Текст кнопки
             * @returns {Backbone.View} View Меню
             * */
            createMenu: function (options) {
                options = options || {};
                options.buttonView = options.buttonView || DefaultButtonView;
                return factory.createButtonMenu(options);
            },

            /**
             * @memberof module:core.dropdown.factory
             * @method createButtonMenu
             * @description Метод для создания меню
             * @param {Object} options Constructor options
             * @param {Backbone.View} options.buttonView View кнопки
             * @param {Backbone.Model} [options.buttonModel] Модель кнопки
             * @param {Boolean} [options.customAnchor=false] Использовать кастомный якорь popout'а (с классом .js-anchor)
             * @param {String} [options.direction=down] Вертикальное расположение popout'а относительно якоря (up/bottom)
             * @param {Boolean} [options.fade=false] Fade-эффект
             * @param {String} [options.height=auto] (auto/bottom)
             * @param {Array} options.items Элементы меню
             * @param {String} [options.popoutFlow=left] Горизонтальное расположение popout'а относительно якоря (left/right)
             * @param {String} [options.text] Текст кнопки
             * @returns {Backbone.View} View Меню
             * */
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
                    customAnchor: options.customAnchor,
                    popoutFlow: options.popoutFlow
                };
                return factory.createPopout(popoutOptions);
            },

            /**
             * @memberof module:core.dropdown.factory
             * @method createDialogPopout
             * @description Метод для создания popout-диалога
             * @param {Object} options Constructor options
             * @param {Backbone.View} options.buttonView View меню
             * @param {Backbone.Model} [options.buttonModel] Модель кнопки
             * @param {Boolean} [options.customAnchor=false] Использовать кастомный якорь popout'а (с классом .js-anchor)
             * @param {String} [options.direction=down] Вертикальное расположение popout'а относительно якоря (up/bottom)
             * @param {Array} options.items Элементы меню
             * @param {String} [options.popoutFlow=left] Горизонтальное расположение popout'а относительно якоря (left/right)
             * @param {String} [options.text] Текст кнопки
             * @returns {Backbone.View} View Меню
             * */
            createDialogPopout: function (options) {
                var defaults = {
                    fade: true,
                    height: 'bottom'
                };
                options = _.extend(defaults, options);
                return factory.createPopout(options);
            },

            /**
             * @memberof module:core.dropdown.factory
             * @method createPopout
             * @description Метод для создания popout
             * @param {Object} options Constructor options
             * @param {Backbone.View} options.buttonView View меню
             * @param {Backbone.Model} [options.buttonModel] Модель кнопки
             * @param {Boolean} [options.customAnchor=false] Использовать кастомный якорь popout'а (с классом .js-anchor)
             * @param {String} [options.direction=down] Вертикальное расположение popout'а относительно якоря (up/bottom)
             * @param {Boolean} [options.fade=false] Fade-эффект
             * @param {String} [options.height=auto] (auto/bottom)
             * @param {Array} options.items Элементы меню
             * @param {String} [options.popoutFlow=left] Горизонтальное расположение popout'а относительно якоря (left/right)
             * @param {String} [options.text] Текст кнопки
             * @returns {Backbone.View} View Меню
             * */
             createPopout: function (options) {
                return new PopoutView(options);
            },

            /**
             * @memberof module:core.dropdown.factory
             * @method createDropdownList
             * @description Метод для создания меню
             * @param {Object} options Constructor options
             * @param {Boolean} [options.autoOpen=true] Показ popout'а по клику на кнопку
             * @param {Backbone.View} options.buttonView View-кнопки
             * @param {Object} [options.buttonViewOptions] Опции кнопки
             * @param {String} [options.panelPosition=down] Расположение dropdown'а (down/down-over/up/up-over)
             * @param {Boolean} [options.renderAfterClose=true] Вызвать render после скрытия popout'а
             * @returns {Backbone.View} View dropdown'а
             * */
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

            /**
             * @memberof module:core.dropdown.factory
             * @method createDropdown
             * @description Метод для создания меню
             * @param {Object} options Constructor options
             * @param {Boolean} [options.autoOpen=true] Показ popout'а по клику на кнопку
             * @param {Backbone.View} options.buttonView View-кнопки
             * @param {Object} [options.buttonViewOptions] Опции кнопки
             * @param {String} [options.panelPosition=down] Расположение dropdown'а (down/down-over/up/up-over)
             * @param {Boolean} [options.renderAfterClose=true] Вызвать render после скрытия popout'а
             * @returns {Backbone.View} View dropdown'а
             * */
            createDropdown: function (options) {
                return new DropdownView(options);
            }
        };

        return factory;
    });
