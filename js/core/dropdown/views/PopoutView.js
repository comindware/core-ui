/**
 * Developer: Stepan Burguchev
 * Date: 11/26/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _ */

define([
    'text!../templates/pop.out.html',
    'core/libApi',
    'core/utils/utilsApi',
    'core/services/WindowService',
    'core/views/behaviors/BlurableBehavior'
], function (template, lib, utils, WindowService, BlurableBehavior) {
    'use strict';

    var slice = Array.prototype.slice;

    var classes = {
        OPEN: 'open',
        DIRECTION_UP: 'popout__up',
        DIRECTION_DOWN: 'popout__down',
        FLOW_LEFT: 'dev-popout-flow-left',
        FLOW_RIGHT: 'dev-popout-flow-right',
        CUSTOM_ANCHOR: 'popout__action-btn',
        DEFAULT_ANCHOR: 'popout__action'
    };

    var config = {
        BOTTOM_HEIGHT_OFFSET: 20,
        TRIANGLE_WIDTH: 16,
        PANEL_OFFSET: 8
    };

    var popoutFlow = {
        LEFT: 'left',
        RIGHT: 'right'
    };

    var popoutDirection = {
        UP: 'up',
        DOWN: 'down'
    };

    var height = {
        AUTO: 'auto',
        BOTTOM: 'bottom'
    };

    var defaultOptions = {
        popoutFlow: popoutFlow.LEFT,
        customAnchor: false,
        fade: false,
        height: 'auto',
        autoOpen: true,
        direction: popoutDirection.DOWN,
        renderAfterClose: true
    };

    /**
     * @name PopoutView
     * @memberof module:core.dropdown.views
     * @class Составная View. Используется для отображения выпадающей панели.
     * Важное отличие от DropdownView: панель отрисовывается в виде бабла, в открытом виде к кнопке от бабла идет треугольник (как в комиксах).
     * <ul>
     * <li>Button View - используется для отображения кнопки, по нажатии на которую всплывает панель.</li>
     * <li>Panel View - используется при отображении выпадающей панели.</li>
     * </ul>
     * Ширина панели не зависит от ширины кнопки и определяется CSS View панели. Высота панели определяется CSS View панели и опцией <code>height</code>.
     * Позиция панели регулируется опциями <code>popoutFlow</code> и <code>direction</code>.<br/>
     * Возможные эвенты:<ul>
     * <li><code>'before:open' (popoutView)</code> - эвент возникает перед открытием панели.</li>
     * <li><code>'open' (popoutView)</code> - эвент возникает после открытия панели.</li>
     * <li><code>'before:close' (popoutView)</code> - эвент возникает перед закрытием панели.</li>
     * <li><code>'close' (popoutView, ...)</code> - эвент возникает после закрытия панели. При программном закрытии через метод close,
     * переданные в нее параметры передаются в это событие.</li>
     * <li><code>'button:\*' </code> - все эвенты buttonView прокидываются в PopoutView с префиксом 'button:'.</li>
     * <li><code>'panel:\*' </code> - все эвенты panelView прокидываются в PopoutView с префиксом 'panel:'.</li>
     * </ul>
     * @constructor
     * @extends Marionette.LayoutView
     * @param {Object} options Объект опций.
     * @param {Marionette.View} options.buttonView View для отображение кнопки.
     * @param {(Object|Function)} [options.buttonViewOptions] Опции, передаваемые в buttonView при создании.
     * @param {Marionette.View} options.panelView View для отображение панели. Создается заново при каждом открытии панели.
     * @param {(Object|Function)} [options.panelViewOptions] Опции, передаваемые в panelView при создании.
     * @param {Boolean} [options.autoOpen=true] Открывать панель автоматически при клике на buttonView.
     * @param {Boolean} [options.customAnchor=false] Использовать кастомный якорь для привязки треугольника бабла. Переданная
     *                                               в buttonView View обязана реализовывать
     *                                               @{link module:core.dropdown.views.behaviors.CustomAnchorBehavior CustomAnchorBehavior}.
     * @param {String} [options.direction='down'] Направление открытие панели. Варианты: <code>'up'</code>, <code>'down'</code>.
     * @param {Boolean} [options.fade=false] Затемнять ли остальную часть экрана при открытии панели.
     * @param {String} [options.height='auto'] Способ определения высоты панели.
     *                                       <ul><li><code>'auto'</code> - определяется через CSS панели.</li>
     *                                       <li><code>'bottom'</code> - всегда привязана к нижней части экрана</li></ul>
     * @param {String} [options.popoutFlow='left'] Определяет позицию панели по горизонтали.
     *                                       <ul><li><code>'left'</code> - левая сторона панели привязана к левой стороне кнопки. Панель растет направо.</li>
     *                                       <li><code>'right'</code> - правая сторона панели привязана к правой стороне кнопки. Панель растет налево.</li></ul>
     * @param {Boolean} [options.renderAfterClose=true] Автоматически вызывать render у buttonView при закрытии панели.
     * */

    return Marionette.LayoutView.extend(/** @lends module:core.dropdown.views.PopoutView.prototype */ {
        initialize: function (options) {
            _.defaults(this.options, defaultOptions);
            utils.helpers.ensureOption(options, 'buttonView');
            utils.helpers.ensureOption(options, 'panelView');
            _.bindAll(this, 'open', 'close', '__handleWindowResize');
        },

        template: Handlebars.compile(template),

        behaviors: {
            BlurableBehavior: {
                behaviorClass: BlurableBehavior,
                onBlur: 'close'
            }
        },

        className: 'popout',

        regions: {
            buttonRegion: '.js-button-region',
            panelRegion: '.js-panel-region'
        },

        ui: {
            button: '.js-button-region',
            panel: '.js-panel-region'
        },

        events: {
            'click @ui.button': '__handleClick'
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
            //noinspection JSValidateTypes
            this.isOpen = false;
            if (this.button) {
                this.stopListening(this.button);
            }
            this.button = new this.options.buttonView(_.result(this.options, 'buttonViewOptions'));
            this.buttonView = this.button;
            this.listenTo(this.button, 'all', function () {
                var args = slice.call(arguments);
                args[0] = 'button:' + args[0];
                this.triggerMethod.apply(this, args);
            });
            this.buttonRegion.show(this.button);

            if (this.options.popoutFlow === popoutFlow.LEFT) {
                this.ui.panel.addClass(classes.FLOW_LEFT);
                this.ui.panel.removeClass(classes.FLOW_RIGHT);
            } else {
                this.ui.panel.addClass(classes.FLOW_RIGHT);
                this.ui.panel.removeClass(classes.FLOW_LEFT);
            }
            if (this.options.customAnchor) {
                this.ui.button.addClass(classes.CUSTOM_ANCHOR);
            } else {
                this.ui.button.addClass(classes.DEFAULT_ANCHOR);
            }

            this.currentDirection = this.options.direction;
            this.updateDirectionClasses();
        },

        updatePanelFlow: function () {
            var rect = {},
                leftPos = 0,
                rightPos = 0,
                triangleWidth = config.TRIANGLE_WIDTH,
                panelOffset = config.PANEL_OFFSET,
                isFlowRight = this.options.popoutFlow === popoutFlow.RIGHT;

            if (this.options.customAnchor) {
                rect = this.button.$el.find('.js-anchor')[0].getBoundingClientRect();
                if (isFlowRight) {
                    rightPos = this.button.$el.width() - rect.width + rect.width / 2 - triangleWidth / 2 - panelOffset;
                } else {
                    leftPos = rect.width / 2 - triangleWidth / 2 - panelOffset;
                }
            } else {
                rect = this.ui.button[0].getBoundingClientRect();
                if (isFlowRight) {
                    leftPos = rect.width - triangleWidth - panelOffset;
                } else {
                    rightPos = -panelOffset;
                }
            }

            if (isFlowRight) {
                this.panelRegion.$el.css({
                    left: leftPos
                });
            } else {
                this.panelRegion.$el.css({
                    right: rightPos
                });
            }
        },

        updateDirectionClasses: function () {
            if (this.currentDirection === popoutDirection.UP) {
                this.ui.button.addClass(classes.DIRECTION_UP);
                this.ui.button.removeClass(classes.DIRECTION_DOWN);

                if (this.panelRegion.$el) {
                    this.panelRegion.$el.removeClass(classes.DIRECTION_DOWN);
                    this.panelRegion.$el.addClass(classes.DIRECTION_UP);
                }
            } else {
                this.ui.button.addClass(classes.DIRECTION_DOWN);
                this.ui.button.removeClass(classes.DIRECTION_UP);

                if (this.panelRegion.$el) {
                    this.panelRegion.$el.removeClass(classes.DIRECTION_UP);
                    this.panelRegion.$el.addClass(classes.DIRECTION_DOWN);
                }
            }
        },

        __handleClick: function () {
            if (this.options.autoOpen) {
                this.open();
            }
        },

        /**
         * Открыть выпадающую панель.
         * */
        open: function () {
            if (this.isOpen) {
                return;
            }
            this.trigger('before:open', this);

            var panelViewOptions = _.extend(_.result(this.options, 'panelViewOptions') || {}, {
                parent: this
            });
            if (this.panelView) {
                this.stopListening(this.panelView);
            }
            this.panelView = new this.options.panelView(panelViewOptions);
            this.listenTo(this.panelView, 'all', function () {
                var args = slice.call(arguments);
                args[0] = 'panel:' + args[0];
                this.triggerMethod.apply(this, args);
            });
            this.$el.addClass(classes.OPEN);
            if (this.options.fade) {
                WindowService.fadeIn();
            }
            this.ui.panel.css('display', 'block');
            this.ui.panel.show({
                duration: 0,
                complete: function () {
                    this.panelRegion.show(this.panelView);
                    if (this.options.height === height.BOTTOM) {
                        $(window).on('resize', this.__handleWindowResize);
                        this.__handleWindowResize();
                    }
                    this.correctDirection();
                    this.updatePanelFlow();
                    this.focus();
                    //noinspection JSValidateTypes
                    this.isOpen = true;
                    this.trigger('open', this);
                }.bind(this)
            });
        },

        correctDirection: function () {
            var panelHeight = this.panelRegion.$el.height(),
                viewportHeight = window.innerHeight,
                panelTopOffset = $(this.panelRegion.$el)[0].getBoundingClientRect().top;

            if (this.currentDirection === popoutDirection.UP && panelTopOffset < panelHeight) {
                this.currentDirection = popoutDirection.DOWN;
                this.updateDirectionClasses();
            } else if (this.currentDirection === popoutDirection.DOWN &&
                       viewportHeight - panelTopOffset < panelHeight &&
                       panelHeight < panelTopOffset ) {
                this.currentDirection = popoutDirection.UP;
                this.panelRegion.$el.css({
                    top: -(panelHeight + config.BOTTOM_HEIGHT_OFFSET)
                });
                this.updateDirectionClasses();
            }
        },

        /**
         * Закрыть выпадающую панель.
         * @param {...*} arguments Агрументы, которые будут переданы в эвент <code>'close'</code>
         * */
        close: function () {
            if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
                return;
            }
            this.trigger('before:close', this);
            if (this.options.fade) {
                WindowService.fadeOut();
            }
            if (this.options.height === height.BOTTOM) {
                $(window).off('resize', this.__handleWindowResize);
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

        __handleWindowResize: function () {
            var outlineDiff = (this.panelView.$el.outerHeight() - this.panelView.$el.height());
            var panelHeight = $(window).height() - this.panelView.$el.offset().top - outlineDiff - config.BOTTOM_HEIGHT_OFFSET;
            this.panelView.$el.height(panelHeight);
        }
    });
});
