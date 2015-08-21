/**
 * Developer: Grigory Kuznetsov
 * Date: 18.08.2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([],
    function (
        utils, NativeGridView

    ) {
        'use strict';

        return {
            getFilterViewByType: function (type) {
                var FilterView =  Marionette.ItemView.extend({
                    template: Handlebars.compile('<div class="innerDiv">popoutView</div>'),

                    className: 'dev-filter-popout',

                    onShow: function () {
                    },

                    __handleBlur: function () {
                        setTimeout(function () {
                            if ($.contains(this.el, document.activeElement)) {
                                $(document.activeElement).one('blur', this.__handleBlur);
                            }
                            //else {
                       //         this.close();
                       //     }
                        }.bind(this), 15);
                    }

                    //close: function () {
                    //    if (!this.isOpen || !$.contains(document.documentElement, this.el)) {
                    //        return;
                    //    }
                    //    var closeArgs = _.toArray(arguments);
                    //    this.ui.panel.hide({
                    //        duration: 0,
                    //        complete: function () {
                    //            this.$el.removeClass(classes.OPEN);
                    //            this.panelRegion.reset();
                    //            //noinspection JSValidateTypes
                    //            this.isOpen = false;
                    //            // selecting focusable parent after closing is important to maintant nested dropdowns
                    //            var firstFocusableParent = this.ui.panel.parents().filter(':focusable')[0];
                    //            if (firstFocusableParent) {
                    //                $(firstFocusableParent).focus();
                    //            }
                    //
                    //            this.trigger.apply(this, [ 'close', this ].concat(closeArgs));
                    //            this.render();
                    //        }.bind(this)
                    //    });
                    //}
                });
                return FilterView;
            }
        };

    }
);
