/**
 * Developer: Stepan Burguchev
 * Date: 12/1/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([ 'core/libApi' ],
    function () {
        'use strict';

        var classes = {
            ANCHOR: 'dropdown__anchor'
        };

        /**
         * Конструктор Marionette.Behavior никогда не вызывается явно. Описанные в объекте options свойства должны
         * быть переданы как свойства behavior (см. документацию Marionette).
         * @name CustomAnchorBehavior
         * @memberof module:core.dropdown.views.behaviors
         * @class Behavior требуется при использовании {@link module:core.dropdown.views.PopoutView PopoutView} в режиме <code>customAnchor: true</code>.
         * Указанная в свойстве <code>buttonView</code> View должна иметь данный behavior, определяющий место привязки треугольника для бабла (якорь, anchor).
         * @constructor
         * @extends Marionette.Behavior
         * @param {Object} options Объект опций
         * @param {String} [options.anchor] jQuery-селектор для DOM-элемента, который используется в качестве якоря.
         *                                  Если не указан, используется рутовый элемент View.
         * @param {Marionette.View} view View на которую применен данных Behavior
         * */

        return Marionette.Behavior.extend(/** @lends module:core.dropdown.views.behaviors.CustomAnchorBehavior.prototype */ {
            initialize: function (options, view) {
            },

            onRender: function () {
                var $el;
                if (this.options.anchor) {
                    $el = this.$(this.options.anchor);
                } else {
                    $el = this.$el;
                }
                $el.addClass(classes.ANCHOR);
            }
        });
    });
