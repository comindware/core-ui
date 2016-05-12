define([
    'comindware/core', 'demoPage/views/CanvasView', 'demoPage/views/DemoProfilePanelView'
], function (core, CanvasView, DemoProfilePanelView) {
    'use strict';
    return function () {
        var collection = new Backbone.Collection(_.map(
            [
                'Alexander Drozd',
                'Alexandra Bitirim',
                'Alexander Egorov',
                'Alexandra Sindyaeva',
                'Alexey Prykin',
                'Anastasia Nagaeva',
                'Anatoly Belaychuk',
                'Alexander Pankov',
                'Alexey Prykin',
                'Anatoly Belaychuk'
            ], function (fullName, i) {
                return {
                    id: i,
                    fullName: fullName
                };
            }));

        /* В реальном коде ОБЯЗАТЕЛЬНО следуйте правилу "одна View - один файл", не объявляйте их инлайном. */

        /* Объявленные ниже View не имеют никаких особенностей или хитрых behaviors. */

        var DemoDropdownItemView = Marionette.ItemView.extend({
            template: Handlebars.compile('{{fullName}}'),
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
                this.$el.css({
                    'box-sizing': 'content-box',
                    padding: '0 5px'
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
