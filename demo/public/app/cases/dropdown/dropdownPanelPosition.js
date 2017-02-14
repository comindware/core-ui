define([
    'comindware/core',
    'demoPage/views/CanvasView'
], function (core, CanvasView) {
    'use strict';
    return function () {
        var collection = new Backbone.Collection(core.services.UserService.listUsers(), {
            comparator: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'name')
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

        /*
          Possible panelPosition values:
             'down',
             'down-over',
             'up',
             'up-over'
        */

        var dropdown = core.dropdown.factory.createDropdown({
            buttonView: DemoButtonView,
            panelView: DemoDropdownPanelView,
            panelViewOptions: {
                collection: collection
            },
            panelPosition: 'down-over'
        });

        return new CanvasView({
            view: dropdown,
            canvas: {
                width: '300px'
            }
        });
    };
});
