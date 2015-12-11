/**
 * Developer: Stepan Burguchev
 * Date: 7/23/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Backbone, _ */

define([ 'module/lib' ],
    function () {
        'use strict';

        /**
         * Конструктор Behavior никогда не вызывается явно. Описанные в объекте options свойства должны
         * быть переданы как свойства behavior (см. документацию Marionette).
         * @name HighlightableBehavior
         * @memberof module:core.collection.behaviors
         * @class Behavior требуется для подсветки текста в моделях коллекции. Стандартный сценарий использования:
         * текстовый поиск с подсветкой найденных фрагментах в элементах списка.
         * @constructor
         * */

        var HighlightableBehavior = function () {
        };

        _.extend(HighlightableBehavior.prototype, /** @lends module:core.collection.behaviors.HighlightableBehavior.prototype */ {
            /**
             * Подсветить заданный текст во всех моделях.
             * @param {String} text Текст, который необходимо подсветить.
             * */
            highlight: function (text)
            {
                this.parentCollection.each(function (record) {
                    if (record.highlight) {
                        record.highlight(text);
                    }
                });
            },

            /**
             * Снять подсветку во всех моделях.
             * */
            unhighlight: function ()
            {
                this.parentCollection.each(function (record) {
                    if (record.unhighlight) {
                        record.unhighlight();
                    }
                });
            }
        });

        return HighlightableBehavior;
    });
