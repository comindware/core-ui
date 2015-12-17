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

        /**
         * Фабрика контролов с выпадающими панелями
         * @namespace factory
         * @memberof module:core.dropdown
         * */

        return /** @lends module:core.dropdown.factory */ {
            /**
             * @description Метод служит для быстрого создания меню на базе {@link module:core.dropdown.views.PopoutView PopoutView}.
             *              В качестве <code>buttonView</code> и <code>panelView</code> (если они не заданы в опциях явно)
             *              используются предустановленные View для меню. Остальные опции PopoutView передаются 'as is'.
             * @param {Object} options Объект опций {@link module:core.dropdown.views.PopoutView PopoutView}. Доступны дополнительные опции, приведенные ниже:
             * @param {Array} options.items Элементы списка меню. Могут быть переданы как простой массив объектов <code>{ id, name }</code>
             *                              или как Backbone.Collection.
             * @param {String} [options.text] Текст кнопки меню. Если не задан, требуется вручную установить опцию <code>buttonView</code>.
             * @returns {Backbone.View} View Меню
             * */
            createMenu: function(options) {
                options = options || {};
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

                return this.createPopout(_.extend({
                    buttonView: DefaultButtonView,
                    buttonViewOptions: {
                        model: effectiveButtonModel
                    },
                    panelView: MenuPanelView,
                    panelViewOptions: {
                        collection: collection
                    }
                }, options));
            },

            /**
             * @description Метод служит для создания {@link module:core.dropdown.views.PopoutView PopoutView} в режиме диалога.
             *              Выпадающая панель занимает все пространство до низа экрана, а область вокруг затемняется.
             *              Метод устанавливает опции <code>{ fade: true, height: 'bottom' }</code>.
             * @param {Object} options Объект опций {@link module:core.dropdown.views.PopoutView PopoutView}
             * @returns {PopoutView} Экземпляр PopoutView
             * */
            createDialogPopout: function (options) {
                var defaults = {
                    fade: true,
                    height: 'bottom'
                };
                options = _.extend(defaults, options);
                return this.createPopout(options);
            },

            /**
             * @description Метод вызывает стандартный конструктор
             *              {@link module:core.dropdown.views.PopoutView PopoutView} передавая ему опции 'as is'.
             * @param {Object} options Объект опций {@link module:core.dropdown.views.PopoutView PopoutView}
             * @returns {PopoutView} Экземпляр PopoutView
             * */
            createPopout: function (options) {
                return new PopoutView(options);
            },

            /**
             * @description Метод вызывает стандартный конструктор
             *              {@link module:core.dropdown.views.DropdownView DropdownView} передавая ему опции 'as is'.
             * @param {Object} options Объект опций {@link module:core.dropdown.views.DropdownView DropdownView}
             * @returns {DropdownView} Экземпляр DropdownView
             * */
            createDropdown: function (options) {
                return new DropdownView(options);
            }
        };
    });
