/**
 * Developer: Stepan Burguchev
 * Date: 11/27/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define(['text!../templates/dropdown.html', 'module/lib', 'core/utils/utilsApi'],
    function (template, lib, utils) {
        'use strict';

        var classes = {
            OPEN: 'open',
            DROPDOWN_DOWN: 'dropdown__wrp_down',
            DROPDOWN_WRP_OVER: 'dropdown__wrp_over',
            DROPDOWN_UP: 'dropdown__wrp_up',
            DROPDOWN_UP_OVER: 'dev-panel-up-over'
        };

        var panelPosition = {
            DOWN: 'down',
            DOWN_OVER: 'down-over',
            UP: 'up',
            UP_OVER: 'up-over'
        };

        var defaultOptions = {
            autoOpen: true,
            renderAfterClose: true,
            panelPosition: panelPosition.DOWN
        };

        /**
         * @name DropdownView
         * @memberof module:core.dropdown.views
         * @class Составная View. Используется для отображения выпадающей панели. Реализует логику HTML-элемента SELECT:
         * ширина панели привязана к ширине кнопки.
         * <ul>
         * <li>Button View - используется для отображения кнопки, по нажатии на которую всплывает панель.</li>
         * <li>Panel View - используется при отображении выпадающей панели.</li>
         * </ul>
         * Ширина панели определяется CSS View панели, но не может быть меньше ширины кнопки. Высота панели определяется CSS View панели.
         * Позиция панели регулируется опцией <code>panelPosition</code>.<br/>
         * Возможные эвенты:<ul>
         * <li><code>'open' (dropdownView)</code> - эвент возникает после открытия панели.</li>
         * <li><code>'close' (dropdownView, ...)</code> - эвент возникает после закрытия панели. При программном закрытии через метод close,
         * переданные в нее параметры передаются в это событие.</li>
         * <li><code>'button:\*' </code> - все эвенты buttonView прокидываются в DropdownView с префиксом 'button:'.</li>
         * <li><code>'panel:\*' </code> - все эвенты panelView прокидываются в DropdownView с префиксом 'panel:'.</li>
         * </ul>
         * @constructor
         * @extends Marionette.LayoutView
         * @param {Object} options Объект опций.
         * @param {Marionette.View} options.buttonView View для отображение кнопки.
         * @param {(Object|Function)} [options.buttonViewOptions] Опции, передаваемые в buttonView при создании.
         * @param {Marionette.View} options.panelView View для отображение панели. Создается заново при каждом открытии панели.
         * @param {(Object|Function)} [options.panelViewOptions] Опции, передаваемые в panelView при создании.
         * @param {Boolean} [options.autoOpen=true] Открывать панель автоматически при клике на buttonView.
         * @param {String} [options.panelPosition='down'] Направление открытие панели. Варианты:
         *       <ul><li><code>'down'</code> - панель выпадает вниз.</li>
         *       <li><code>'down-over'</code> - панель выпадает вниз, но верхняя ее граница располагается на верхней границе кнопки и перекрывает ее.</li>
         *       <li><code>'up'</code> - панель выпадает наверх.</li>
         *       <li><code>'up-over'</code> - панель выпадает вверх, но нижняя ее граница располагается на нижней границе кнопки и перекрывает ее.</li></ul>
         * @param {Boolean} [options.renderAfterClose=true] Автоматически вызывать render у buttonView при закрытии панели.
         * */

        return Marionette.LayoutView.extend(/** @lends module:core.dropdown.views.DropdownView.prototype */ {
            initialize: function (options) {
                _.extend(this.options, _.clone(defaultOptions), options || {});
                utils.helpers.ensureOption(options, 'buttonView');
                utils.helpers.ensureOption(options, 'panelView');
                _.bindAll(this, 'open', 'close', '__handleBlur');
            },

            template: Handlebars.compile(template),

            className: 'dropdown',

            regions: {
                buttonRegion: '.js-button-region',
                panelRegion: '.js-panel-region'
            },

            ui: {
                button: '.js-button-region',
                panel: '.js-panel-region'
            },

            events: {
                'click @ui.button': '__handleClick',
                'blur @ui.panel': '__handleBlur'
            },

            /**
             * Экземпляр button View, если View отрендерена. Иначе null.
             * */
            buttonView: null,

            /**
             * Экземпляр panel View, если панель открыта. Иначе null. Пересоздается при каждом открытии панели (!).
             * */
            panelView: null,

            onRender: function () {
                if (this.button) {
                    this.stopListening(this.button);
                }
                this.button = new this.options.buttonView(_.extend({ parent: this }, _.result(this.options, 'buttonViewOptions')));
                this.buttonView = this.button;
                this.listenTo(this.button, 'all', function() {
                    var args = Array.prototype.slice.call(arguments);
                    args[0] = 'button:' + args[0];
                    this.triggerMethod.apply(this, args);
                });
                this.buttonRegion.show(this.button);

                this.currentPosition = this.options.panelPosition;
                this.updatePositionClasses();
            },

            updatePositionClasses: function () {
                if (this.currentPosition === panelPosition.DOWN) {
                    this.ui.panel.removeClass(classes.DROPDOWN_WRP_OVER)
                        .removeClass(classes.DROPDOWN_UP)
                        .removeClass(classes.DROPDOWN_UP_OVER);

                    this.ui.panel.addClass(classes.DROPDOWN_DOWN);
                } else if (this.currentPosition === panelPosition.DOWN_OVER) {
                    this.ui.panel.removeClass(classes.DROPDOWN_DOWN)
                        .removeClass(classes.DROPDOWN_UP)
                        .removeClass(classes.DROPDOWN_UP_OVER);

                    this.ui.panel.addClass(classes.DROPDOWN_WRP_OVER);
                } else if (this.currentPosition === panelPosition.UP) {
                    this.ui.panel.removeClass(classes.DROPDOWN_WRP_OVER)
                        .removeClass(classes.DROPDOWN_DOWN)
                        .removeClass(classes.DROPDOWN_UP_OVER);

                    this.ui.panel.addClass(classes.DROPDOWN_UP);
                } else if (this.currentPosition === panelPosition.UP_OVER) {
                    this.ui.panel.removeClass(classes.DROPDOWN_WRP_OVER)
                        .removeClass(classes.DROPDOWN_UP)
                        .removeClass(classes.DROPDOWN_DOWN);

                    this.ui.panel.addClass(classes.DROPDOWN_UP_OVER);
                }
            },

            correctPosition: function () {
                var panelHeight = this.panelRegion.$el.height(),
                    viewportHeight = window.innerHeight,
                    panelTopOffset = $(this.buttonRegion.$el)[0].getBoundingClientRect().top;

                if ((this.currentPosition === panelPosition.UP || this.currentPosition === panelPosition.UP_OVER) &&
                    panelTopOffset < panelHeight) {
                    this.currentPosition = this.currentPosition === panelPosition.UP ? panelPosition.DOWN : panelPosition.DOWN_OVER;
                    this.updatePositionClasses();
                } else if ((this.currentPosition === panelPosition.DOWN || this.currentPosition === panelPosition.DOWN_OVER) &&
                            viewportHeight - panelTopOffset < panelHeight ||
                            (this.currentPosition === panelPosition.UP || this.currentPosition === panelPosition.UP_OVER)) {
                    this.currentPosition = this.currentPosition === panelPosition.DOWN_OVER ? panelPosition.UP_OVER : panelPosition.UP;
                    this.updatePositionClasses();
                }
            },

            /**
             * Открыть выпадающую панель.
             * */
            open: function () {
                if (this.isOpen) {
                    return;
                }
                var panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
                    parent: this
                });

                this.$el.addClass(classes.OPEN);
                this.ui.panel.css('display', 'block');
                if (this.panelView) {
                    this.stopListening(this.panelView);
                }
                this.panelView = new this.options.panelView(panelViewOptions);
                this.listenTo(this.panelView, 'all', function() {
                    var args = Array.prototype.slice.call(arguments);
                    args[0] = 'panel:' + args[0];
                    this.triggerMethod.apply(this, args);
                });

                this.panelRegion.show(this.panelView);
                this.correctPosition();

                if ($.contains(this.el, document.activeElement)) {
                    $(document.activeElement).one('blur', this.__handleBlur);
                } else {
                    this.ui.panel.focus();
                }
                //noinspection JSValidateTypes
                this.isOpen = true;
                this.trigger('open', this);
            },

            /**
             * Закрыть выпадающую панель.
             * @param {...*} arguments Агрументы, которые будут переданы в эвент <code>'close'</code>
             * */
            close: function () {
                if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
                    return;
                }

                // selecting focusable parent after closing is important to maintant nested dropdowns
                // focused element MUST be changed BEFORE active element is hidden or destroyed (!)
                var firstFocusableParent = this.ui.panel.parents().filter(':focusable')[0];
                if (firstFocusableParent) {
                    $(firstFocusableParent).focus();
                }

                var closeArgs = _.toArray(arguments);
                this.ui.panel.hide({
                    duration: 0,
                    complete: function () {
                        this.$el.removeClass(classes.OPEN);
                        this.panelRegion.reset();
                        //noinspection JSValidateTypes
                        this.isOpen = false;

                        this.trigger.apply(this, [ 'close', this ].concat(closeArgs));
                        if (this.options.renderAfterClose) {
                            this.render();
                        }
                    }.bind(this)
                });
            },

            __handleClick: function () {
                if (this.options.autoOpen) {
                    this.open();
                }
            },

            __handleBlur: function () {
                setTimeout(function () {
                    if ($.contains(this.el, document.activeElement)) {
                        $(document.activeElement).one('blur', this.__handleBlur);
                    } else {
                        this.close();
                    }
                }.bind(this), 15);
            }
        });
    });
