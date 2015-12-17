/**
 * Developer: Stepan Burguchev
 * Date: 12/12/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
        'core/libApi',
        'core/list/listApi',
        'core/utils/utilsApi',
        '../models/SearchMoreModel'
    ],
    function(lib, list, utils, SearchMoreModel) {
        'use strict';

        /**
         * @name BaseReferenceEditorController
         * @memberof module:core.form.editors.reference.controllers
         * @class Провайдер данных для {@link module:core.form.editors.ReferenceEditorView ReferenceEditorView}.
         * Запрос к данным осуществляется через переданную в опции (<code>options.collection</code>) Backbone-коллекцию.
         * В различных сценариях автоматически выбирается использование клиентской или серверной валидации.
         * @param {Object} options Объект опций.
         * @param {Backbone.Collection} options.collection Backbone.Collection объектов с атрибутами <code>{ id, text }</code>.
         * Коллекция должна реализовывать метод <code>fetch</code> с текстовой фильтрацией: <code>fetch({ data: { filter: 'myFilterText' } })</code>.
         * Результатом выполнения метода <code>fetch</code> является заполненная данными коллекция и установленное свойство <code>collection.totalCount</code>,
         * указывающее суммарное количество элементов, удовлетворяющих фильтру (может быть больше чем количество полученных).
         * */

        return Marionette.Controller.extend( /** @lends module:core.form.editors.reference.controllers.BaseReferenceEditorController.prototype */ {
            initialize: function(options) {
                utils.helpers.ensureOption(options, 'collection');

                this.originalCollection = options.collection;
                this.collection = list.factory.createWrappedCollection(options.collection);
            },

            /**
             * Запрос на получение данных с указанными фильтрами.
             * @param {Object} options Объект опций.
             * @param {Object} options.text Активный текстовый фильтр.
             * @return {Promise} объект-Promise, срабатывающий по окончанию загрузки.
             * */
            fetch: function(options) {
                options = options || {};

                var filterText = options.text ? options.text.trim().toUpperCase() : '';
                if (filterText.indexOf(this.activeFilterText) && this.totalCount) {
                    // Client-side filter
                    if (filterText) {
                        this.collection.filter(function(model) {
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
                    return Promise.resolve();
                }
                // Server-side filter or new data request
                this.collection.filter(null);
                this.fetchPromise = this.collection.fetch({ data: { filter: filterText } })
                    .then(function() {
                        this.totalCount = this.collection.totalCount;
                        this.activeFilterText = filterText;
                    }.bind(this));

                return this.fetchPromise;
            },

            /*
            * Объект Backbone.Collection, используемый для чтения данных. Напрямую не модифицируется.
            * */
            collection: null,

            /**
             * Запрос на осуществление навигации по заданному объекту (к примеру, открытие карточки пользователя).
             * Должен быть реализован в классе-наследнике.
             * @param {Backbone.Model} model Модель объекта, на который требуется осуществить навигацию.
             * */
            navigate: function(model) {
                utils.helpers.throwError('Not Implemented.', 'NotImplementedError');
            }
        });
    });
