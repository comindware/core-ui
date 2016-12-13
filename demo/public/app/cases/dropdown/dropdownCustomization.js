define([
    'comindware/core', 'demoPage/views/CanvasView', 'demoPage/views/DemoProfilePanelView'
], function (core, CanvasView, DemoProfilePanelView) {
    'use strict';
    return function () {
        var collection = new Backbone.Collection(core.services.UserService.listUsers(), {
            comparator: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'name')
        });

        /* В реальном коде ОБЯЗАТЕЛЬНО следуйте правилу "одна View - один файл", не объявляйте их инлайном. */

        var DemoDropdownItemView = Marionette.ItemView.extend({
            template: Handlebars.compile('{{name}}'),
            className: 'dropdown-list__i'
        });

        var DemoDropdownPanelView = Marionette.CollectionView.extend({
            childView: DemoDropdownItemView,
            className: 'dropdown-list',
            onRender: function () {
                this.$el.css({
                    'overflow-y': 'auto'
                });
            }
        });

        var DemoButtonView = Marionette.ItemView.extend({
            template: function () {
                return Handlebars.compile('<input type="text" class="field js-input" placeholder="Enter text here">');
            },
            onRender: function () {
                this.$('.js-input').css({
                    width: '100%',
                    'box-sizing': 'border-box'
                });
            }
        });

        var dropdown = core.dropdown.factory.createDropdown({
            buttonView: DemoButtonView,
            panelView: DemoDropdownPanelView,
            panelViewOptions: {
                collection: collection
            }
        });

        return new CanvasView({
            view: dropdown,
            canvas: {
                width: '300px'
            }
        });
    };
});
